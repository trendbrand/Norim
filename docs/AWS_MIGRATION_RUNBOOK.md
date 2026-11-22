# NormInvoice — AWS Migration Runbook (eu-central-1)

> Status (23 Nov 2026): the Terraform in `infra/aws/` is the **blueprint**. It was authored in this
> repo and has **not** been applied against a live AWS account from here, and no AWS resources were
> created. Run `terraform init/validate/plan` in your account and reconcile any provider-version
> argument differences before `apply`. Everything below is the intended procedure, not a completed
> state. The running product is still the **single-node SQLite MVP**; §3 is the real remaining work.

## 0. What this provisions

EU-resident stack in **eu-central-1 (Frankfurt)**: VPC (public+private subnets, NAT), **RDS
PostgreSQL 16** (private, KMS-encrypted, Multi-AZ in prod), **S3 + Object Lock (WORM)** for GoBD
archives, **SQS + DLQ** (durable outbox), **Secrets Manager** + **KMS**, **ECR**, **ECS Fargate +
ALB**, and **CloudFront + WAFv2**. CloudFront/WAF are created via the `us-east-1` provider alias.

## 1. Prerequisites

- An AWS account + credentials with admin (or scoped) permissions; `aws configure` / SSO.
- Terraform ≥ 1.6, Docker, and the AWS CLI locally.
- (Recommended) an S3 state bucket + DynamoDB lock table; uncomment the `backend "s3"` block in
  `infra/aws/versions.tf`.

## 2. Provision the infrastructure (two phases)

The ECS service needs a container image, which needs the ECR repo to exist first.

```bash
cd infra/aws
cp terraform.tfvars.example terraform.tfvars   # edit values
terraform init
terraform validate
terraform plan -out tf.plan
terraform apply tf.plan
```

Then build and push the web image (the Dockerfile already emits a standalone, non-root runner):

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO=$(terraform output -raw ecr_repository_url)
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.eu-central-1.amazonaws.com"
docker build -f ../Dockerfile.web -t "$REPO:v1" ../..
docker push "$REPO:v1"
```

Set `app_image = "<repo>:v1"` in `terraform.tfvars` and `terraform apply` again (or register a new
task-definition revision in CI and update the service).

## 3. App-layer data migration — SQLite → RDS Postgres (the real remaining work)

The app currently uses embedded `node:sqlite` (`apps/web/src/lib/db-store.ts`). A Postgres path
exists but is **inert** (`packages/db` schema + `apps/web/src/lib/db-repository.ts` /
`pg-persistence.ts`). To run on RDS:

1. **Activate the Postgres repository** behind `DATABASE_URL`: route the data-access layer to
   `db-repository.ts` when `DATABASE_URL` is set, keeping SQLite as the local-dev default.
2. **Schema:** apply the Drizzle schema in `packages/db` to RDS (generate + run migrations). Enable
   **row-level security** (tenant isolation defence-in-depth) on tenant tables.
3. **Backfill data** from the existing SQLite volume: export each table to CSV/JSON and load into
   Postgres (money as `DECIMAL`, timestamps as `timestamptz`). Verify row counts and the GoBD audit
   hash-chain after load.
4. **Outbox → SQS:** the in-process `transmission-outbox.ts` drainer maps 1:1 onto SQS — enqueue to
   `SQS_QUEUE_URL`, drain with a worker service (reuse `services/worker`), keep the same idempotency
   key and dead-letter semantics (SQS redrive `maxReceiveCount = 6`).
5. **Artifacts → S3 WORM:** finalized XML/PDF already archive to S3 when `S3_*` is set; point them at
   the `s3_archive_bucket` output with Object Lock (GOVERNANCE, 8/10-yr).

Until step 1–3 land, run `app_desired_count = 1` (SQLite is not shareable across tasks). After RDS is
the source of truth, raise the desired count and remove the SQLite volume.

## 4. Secrets & environment

Terraform generates and stores these in Secrets Manager (`app_secret_arn`), injected into the task
as env vars — never plaintext in the task definition:

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | RDS Postgres connection |
| `AUTH_SECRET` | customer session signing |
| `STAFF_AUTH_SECRET` | **separate** admin realm signing (≠ AUTH_SECRET) |
| `APP_ENCRYPTION_KEY_HEX` | integration-secret envelope encryption |
| `S3_BUCKET`, `SQS_QUEUE_URL` | archive + outbox |

Still set out-of-band (payment/email/partner): `RESEND_API_KEY`, `PADDLE_*`, `STRIPE_WEBHOOK_SECRET`,
`PEPPOL_AP_*`, `STAFF_ADMIN_EMAILS` + `STAFF_ADMIN_PASSWORD(_HASH)`. Also set `S3_OBJECT_LOCK_ENABLED=true`.

## 5. Cutover

1. Provision infra (§2), push image, migrate data to RDS (§3) with the app in a **staging** env first.
2. Run acceptance (issue + receive + validate + deliver + accountant export) against RDS/staging.
3. DNS: CNAME your domain to the `cloudfront_domain` output (ACM cert in us-east-1 for a custom alias).
4. Flip production DNS; keep the Hetzner SQLite node read-only as rollback for one retention window.

## 6. Rollback

- Infra: `terraform destroy` is gated by `deletion_protection` on RDS and Object Lock on S3 (WORM
  objects cannot be deleted before expiry — by design). Roll back app via DNS to the previous node.
- Data: RDS has 14-day automated backups + a final snapshot on prod; restore to a point in time.

## 7. Cost & residency notes

- All data resources are in eu-central-1; CloudFront is global but WAF/ACM for it live in us-east-1
  (control plane only). Review access from non-EU operators (Privacy Policy / transfer assessment).
- Baseline is NAT-gateway + RDS + Fargate + ALB; the main fixed costs are the two NAT gateways and
  RDS. For staging, set `az_count = 1` and `db_instance_class = db.t4g.micro`.
