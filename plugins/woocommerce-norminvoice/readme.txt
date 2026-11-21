=== NormInvoice EU E-Invoicing Bridge ===
Contributors: norminvoice
Tags: woocommerce, zugferd, factur-x, xrechnung, en16931, einvoice, gobd, datev, peppol
Requires at least: 6.2
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

HPOS-compatible WooCommerce bridge converting completed B2B orders into EN 16931 ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0 e-invoices.

== Description ==

NormInvoice EU E-Invoicing Bridge connects your WooCommerce store to NormInvoice (100% EU hosted in Germany) without bloating your WordPress server with heavy PDF or Ghostscript libraries.

Key Features:
* Official WooCommerce HPOS (High-Performance Order Storage) & Checkout Blocks compatibility.
* Adds validated EU VAT ID (USt-IdNr. / N° TVA — BT-48) and optional German B2G Leitweg-ID (BT-10) checkout fields.
* Dispatches completed B2B orders over TLS-verified HTTPS webhooks signed with HMAC-SHA256.
* Built-in idempotency protection prevents duplicate invoices when order statuses are toggled.
* Manual "Send / Resend E-Invoice to NormInvoice" order action inside WooCommerce Admin.

== Privacy & External Service Disclosure (GDPR) ==

When an order reaches Completed status (or an admin triggers Resend), this plugin transmits billing details, EU VAT ID, optional Leitweg-ID, and order line items over encrypted HTTPS to the NormInvoice endpoint configured by the store owner (default: https://norminvoice.eu/api/webhooks/woocommerce).
* Privacy Policy: https://norminvoice.eu/legal/privacy
* GDPR Art. 28 DPA (AVV): https://norminvoice.eu/legal/dpa

== Installation ==

1. Upload `woocommerce-norminvoice-v1.1.0.zip` via WordPress Admin -> Plugins -> Add New -> Upload Plugin.
2. Activate the plugin and open WooCommerce -> NormInvoice E-Invoice.
3. Enter your HTTPS Webhook URL and HMAC-SHA256 Signing Secret from NormInvoice Settings.

== Changelog ==

= 1.1.0 =
* Added official WooCommerce HPOS (custom_order_tables) & Checkout Blocks compatibility declarations.
* Enforced HTTPS-only webhook endpoints and TLS sslverify.
* Added server-side EU VAT ID format validation, idempotency flag, and manual Resend order action.

= 1.0.0 =
* Initial release supporting ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2, and Peppol BIS 3.0.
