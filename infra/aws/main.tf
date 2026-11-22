locals {
  name = "${var.name_prefix}-${var.environment}"
}

data "aws_availability_zones" "available" {
  state = "available"
}

# ─────────────────────────────────────────────────────────────────────────────
# Network: VPC with public (ALB/NAT) and private (ECS tasks, RDS) subnets.
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = local.name }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = local.name }
}

resource "aws_subnet" "public" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags                    = { Name = "${local.name}-public-${count.index}", Tier = "public" }
}

resource "aws_subnet" "private" {
  count             = var.az_count
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + var.az_count)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags              = { Name = "${local.name}-private-${count.index}", Tier = "private" }
}

resource "aws_eip" "nat" {
  count  = var.az_count
  domain = "vpc"
  tags   = { Name = "${local.name}-nat-${count.index}" }
}

resource "aws_nat_gateway" "main" {
  count         = var.az_count
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  tags          = { Name = "${local.name}-nat-${count.index}" }
  depends_on    = [aws_internet_gateway.main]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${local.name}-public" }
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  tags = { Name = "${local.name}-private-${count.index}" }
}

resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ─────────────────────────────────────────────────────────────────────────────
# Security groups
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "alb" {
  name_prefix = "${local.name}-alb-"
  vpc_id      = aws_vpc.main.id
  ingress {
    description = "HTTPS from CloudFront/clients"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  lifecycle { create_before_destroy = true }
}

resource "aws_security_group" "ecs" {
  name_prefix = "${local.name}-ecs-"
  vpc_id      = aws_vpc.main.id
  ingress {
    description     = "App port from ALB only"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  lifecycle { create_before_destroy = true }
}

resource "aws_security_group" "rds" {
  name_prefix = "${local.name}-rds-"
  vpc_id      = aws_vpc.main.id
  ingress {
    description     = "Postgres from ECS tasks only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  lifecycle { create_before_destroy = true }
}

# ─────────────────────────────────────────────────────────────────────────────
# KMS + Secrets Manager (app + DB secrets; never in task definitions as plaintext)
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_kms_key" "main" {
  description             = "${local.name} encryption (RDS, S3, Secrets)"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}

resource "aws_kms_alias" "main" {
  name          = "alias/${local.name}"
  target_key_id = aws_kms_key.main.key_id
}

resource "random_password" "db" {
  length  = 32
  special = false
}

resource "random_password" "auth_secret" {
  length  = 48
  special = false
}

resource "random_password" "staff_auth_secret" {
  length  = 48
  special = false
}

resource "random_id" "enc_key" {
  byte_length = 32 # 64 hex chars for APP_ENCRYPTION_KEY_HEX
}

resource "aws_secretsmanager_secret" "app" {
  name       = "${local.name}/app"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    DATABASE_URL           = "postgres://${var.db_username}:${random_password.db.result}@${aws_db_instance.main.address}:5432/${var.db_name}"
    AUTH_SECRET            = random_password.auth_secret.result
    STAFF_AUTH_SECRET      = random_password.staff_auth_secret.result
    APP_ENCRYPTION_KEY_HEX = random_id.enc_key.hex
    S3_BUCKET              = aws_s3_bucket.archive.bucket
    SQS_QUEUE_URL          = aws_sqs_queue.transmissions.url
  })
}

# ─────────────────────────────────────────────────────────────────────────────
# RDS PostgreSQL 16 (private, encrypted, Multi-AZ optional)
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = local.name
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "main" {
  identifier                   = local.name
  engine                       = "postgres"
  engine_version               = "16"
  instance_class               = var.db_instance_class
  allocated_storage            = var.db_allocated_storage
  max_allocated_storage        = var.db_allocated_storage * 5
  storage_type                 = "gp3"
  storage_encrypted            = true
  kms_key_id                   = aws_kms_key.main.arn
  db_name                      = var.db_name
  username                     = var.db_username
  password                     = random_password.db.result
  db_subnet_group_name         = aws_db_subnet_group.main.name
  vpc_security_group_ids       = [aws_security_group.rds.id]
  multi_az                     = var.environment == "production"
  backup_retention_period      = 14
  deletion_protection          = var.environment == "production"
  performance_insights_enabled = true
  skip_final_snapshot          = var.environment != "production"
  final_snapshot_identifier    = var.environment == "production" ? "${local.name}-final" : null
  apply_immediately            = false
}

# ─────────────────────────────────────────────────────────────────────────────
# S3 WORM archive (GoBD 8/10-yr retention) + ECR
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "archive" {
  bucket              = "${local.name}-archive-${data.aws_caller_identity.current.account_id}"
  object_lock_enabled = true
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_versioning" "archive" {
  bucket = aws_s3_bucket.archive.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_object_lock_configuration" "archive" {
  bucket = aws_s3_bucket.archive.id
  rule {
    default_retention {
      mode  = "GOVERNANCE"
      years = var.worm_retention_years
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "archive" {
  bucket = aws_s3_bucket.archive.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "archive" {
  bucket                  = aws_s3_bucket.archive.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_ecr_repository" "web" {
  name                 = "${var.name_prefix}/web"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration { scan_on_push = true }
  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.main.arn
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# SQS transmission queue + dead-letter queue (durable outbox on AWS)
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_sqs_queue" "transmissions_dlq" {
  name                      = "${local.name}-transmissions-dlq"
  message_retention_seconds = 1209600 # 14 days
  kms_master_key_id         = aws_kms_key.main.id
}

resource "aws_sqs_queue" "transmissions" {
  name                       = "${local.name}-transmissions"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600 # 4 days
  kms_master_key_id          = aws_kms_key.main.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.transmissions_dlq.arn
    maxReceiveCount     = 6
  })
}

# ─────────────────────────────────────────────────────────────────────────────
# IAM for ECS tasks
# ─────────────────────────────────────────────────────────────────────────────
data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "${local.name}-task-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Execution role also needs to read the app secret + decrypt with KMS.
resource "aws_iam_role_policy" "task_execution_secrets" {
  role = aws_iam_role.task_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["secretsmanager:GetSecretValue"], Resource = [aws_secretsmanager_secret.app.arn] },
      { Effect = "Allow", Action = ["kms:Decrypt"], Resource = [aws_kms_key.main.arn] }
    ]
  })
}

resource "aws_iam_role" "task" {
  name               = "${local.name}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

# Runtime permissions: SQS (outbox), S3 (WORM archive), KMS, logs.
resource "aws_iam_role_policy" "task_runtime" {
  role = aws_iam_role.task.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = [aws_sqs_queue.transmissions.arn, aws_sqs_queue.transmissions_dlq.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:PutObjectRetention", "s3:ListBucket"]
        Resource = [aws_s3_bucket.archive.arn, "${aws_s3_bucket.archive.arn}/*"]
      },
      { Effect = "Allow", Action = ["kms:Decrypt", "kms:GenerateDataKey"], Resource = [aws_kms_key.main.arn] }
    ]
  })
}

# ─────────────────────────────────────────────────────────────────────────────
# ECS Fargate cluster, task definition, service + ALB
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${local.name}-web"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.main.arn
}

resource "aws_ecs_cluster" "main" {
  name = local.name
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${local.name}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.app_cpu
  memory                   = var.app_memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = var.app_image != "" ? var.app_image : "${aws_ecr_repository.web.repository_url}:latest"
      essential = true
      portMappings = [{ containerPort = var.app_port, protocol = "tcp" }]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(var.app_port) },
        { name = "AWS_REGION", value = var.region },
        { name = "S3_REGION", value = var.region }
      ]
      # Secrets are injected from Secrets Manager (never plaintext).
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${aws_secretsmanager_secret.app.arn}:DATABASE_URL::" },
        { name = "AUTH_SECRET", valueFrom = "${aws_secretsmanager_secret.app.arn}:AUTH_SECRET::" },
        { name = "STAFF_AUTH_SECRET", valueFrom = "${aws_secretsmanager_secret.app.arn}:STAFF_AUTH_SECRET::" },
        { name = "APP_ENCRYPTION_KEY_HEX", valueFrom = "${aws_secretsmanager_secret.app.arn}:APP_ENCRYPTION_KEY_HEX::" },
        { name = "S3_BUCKET", valueFrom = "${aws_secretsmanager_secret.app.arn}:S3_BUCKET::" },
        { name = "SQS_QUEUE_URL", valueFrom = "${aws_secretsmanager_secret.app.arn}:SQS_QUEUE_URL::" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.web.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "web"
        }
      }
    }
  ])
}

resource "aws_lb" "main" {
  name               = substr("${local.name}-alb", 0, 32)
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "web" {
  name        = substr("${local.name}-web", 0, 32)
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    matcher             = "200-399"
  }
}

# HTTP listener (CloudFront terminates TLS; ALB can also be fronted directly).
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_ecs_service" "web" {
  name            = "${local.name}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.app_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = var.app_port
  }

  depends_on = [aws_lb_listener.http]

  lifecycle {
    # Image is updated out-of-band by CI (new task def revision).
    ignore_changes = [task_definition]
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# WAFv2 (CLOUDFRONT scope, us-east-1) + CloudFront in front of the ALB
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_wafv2_web_acl" "cf" {
  provider = aws.us_east_1
  name     = "${local.name}-cf"
  scope    = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.name}-cf"
    sampled_requests_enabled   = true
  }
  rule {
    name     = "AWSManagedCommon"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "common"
      sampled_requests_enabled   = true
    }
  }
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = local.name
  aliases         = var.domain_aliases
  web_acl_id      = aws_wafv2_web_acl.cf.arn

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "alb"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    # CachingDisabled + AllViewerExceptHostHeader managed policies.
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.acm_certificate_arn == ""
    acm_certificate_arn            = var.acm_certificate_arn == "" ? null : var.acm_certificate_arn
    ssl_support_method             = var.acm_certificate_arn == "" ? null : "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}
