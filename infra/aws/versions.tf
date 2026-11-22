# NormInvoice — AWS target infrastructure (eu-central-1 / Frankfurt).
#
# Status: authored as the migration blueprint. It has NOT been applied against a
# live AWS account from this repo. Run `terraform init && terraform validate &&
# terraform plan` in your account and reconcile any provider-version argument
# differences before `terraform apply`. See docs/AWS_MIGRATION_RUNBOOK.md.

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Recommended remote state (uncomment and configure before team use):
  # backend "s3" {
  #   bucket         = "norminvoice-tfstate"
  #   key            = "prod/terraform.tfstate"
  #   region         = "eu-central-1"
  #   dynamodb_table = "norminvoice-tflock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "NormInvoice"
      Environment = var.environment
      ManagedBy   = "terraform"
      DataResidency = "EU"
    }
  }
}

# CloudFront + WAFv2 (CLOUDFRONT scope) must live in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
