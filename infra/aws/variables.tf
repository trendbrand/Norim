variable "region" {
  description = "AWS region (EU data residency for NormInvoice)."
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name (staging | production)."
  type        = string
  default     = "production"
}

variable "name_prefix" {
  description = "Prefix for resource names."
  type        = string
  default     = "norminvoice"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "az_count" {
  description = "Number of Availability Zones to span."
  type        = number
  default     = 2
}

variable "app_image" {
  description = "Full ECR image URI:tag for the web app (push before apply, or use a placeholder then update the service)."
  type        = string
  default     = ""
}

variable "app_port" {
  description = "Container port the Next.js server listens on."
  type        = number
  default     = 3000
}

variable "app_desired_count" {
  description = "Number of ECS tasks (keep at 1 until the app uses RDS instead of embedded SQLite)."
  type        = number
  default     = 1
}

variable "app_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 512
}

variable "app_memory" {
  description = "Fargate task memory (MiB)."
  type        = number
  default     = 1024
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.small"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GiB)."
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Initial Postgres database name."
  type        = string
  default     = "norminvoice"
}

variable "db_username" {
  description = "Postgres master username."
  type        = string
  default     = "norminvoice_app"
}

variable "worm_retention_years" {
  description = "S3 Object Lock (WORM) default retention for GoBD invoice archives."
  type        = number
  default     = 10
}

variable "acm_certificate_arn" {
  description = "ACM cert ARN in us-east-1 for CloudFront (leave empty to use the default *.cloudfront.net cert)."
  type        = string
  default     = ""
}

variable "domain_aliases" {
  description = "Optional custom domains for CloudFront (requires acm_certificate_arn)."
  type        = list(string)
  default     = []
}
