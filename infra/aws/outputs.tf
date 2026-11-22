output "ecr_repository_url" {
  description = "Push the web image here before deploying the service."
  value       = aws_ecr_repository.web.repository_url
}

output "cloudfront_domain" {
  description = "Public CloudFront domain (point your DNS CNAME here)."
  value       = aws_cloudfront_distribution.main.domain_name
}

output "alb_dns_name" {
  description = "Internal/edge ALB DNS name."
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint (reachable only from ECS tasks)."
  value       = aws_db_instance.main.address
}

output "s3_archive_bucket" {
  description = "GoBD WORM archive bucket."
  value       = aws_s3_bucket.archive.bucket
}

output "sqs_queue_url" {
  description = "Transmission outbox queue URL."
  value       = aws_sqs_queue.transmissions.url
}

output "app_secret_arn" {
  description = "Secrets Manager secret holding DATABASE_URL, AUTH_SECRET, etc."
  value       = aws_secretsmanager_secret.app.arn
}

output "ecs_cluster" {
  value = aws_ecs_cluster.main.name
}
