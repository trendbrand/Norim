<?php
/**
 * Plugin Name: NormInvoice EU E-Invoicing Bridge (ZUGFeRD / Factur-X / XRechnung)
 * Plugin URI:  https://norminvoice.eu/integrations/woocommerce
 * Description: HPOS & Checkout-Blocks compatible WooCommerce bridge adding EU VAT ID (BT-48) & German Leitweg-ID (BT-10) checkout fields and streaming completed B2B orders via HMAC-SHA256 webhooks to NormInvoice.
 * Version:     1.1.0
 * Author:      NormInvoice
 * License:     GPLv2 or later
 * Requires at least: 6.2
 * Requires PHP: 8.0
 * WC requires at least: 8.0
 * WC tested up to: 9.6
 */

if (!defined('ABSPATH')) {
    exit;
}

// Declare official WooCommerce HPOS (High-Performance Order Storage) & Cart/Checkout Blocks compatibility
add_action('before_woocommerce_init', static function (): void {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
    }
});

class NormInvoice_Woo_Bridge {
    private const OPTION_ENDPOINT = 'norminvoice_webhook_url';
    private const OPTION_SECRET   = 'norminvoice_webhook_secret';
    private const META_VAT_ID     = '_billing_eu_vat_id';
    private const META_LEITWEG    = '_billing_leitweg_id';
    private const META_SENT_FLAG  = '_norminvoice_dispatched_at';

    public function __construct() {
        add_action('admin_menu', [$this, 'register_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_filter('woocommerce_checkout_fields', [$this, 'add_einvoice_checkout_fields']);
        add_action('woocommerce_checkout_process', [$this, 'validate_checkout_fields']);
        // HPOS-compatible order creation hook (works with custom wc_orders table AND legacy posts)
        add_action('woocommerce_checkout_create_order', [$this, 'save_einvoice_order_meta_hpos'], 10, 2);
        // Dispatch on completed order (idempotent via META_SENT_FLAG)
        add_action('woocommerce_order_status_completed', [$this, 'dispatch_order_if_unsent'], 10, 1);
        // Manual admin "Resend E-Invoice to NormInvoice" order action
        add_filter('woocommerce_order_actions', [$this, 'register_order_action']);
        add_action('woocommerce_order_action_norminvoice_resend', [$this, 'handle_manual_resend']);
    }

    public function register_settings_page(): void {
        add_submenu_page(
            'woocommerce',
            __('NormInvoice EU E-Invoicing', 'norminvoice'),
            __('NormInvoice E-Invoice', 'norminvoice'),
            'manage_woocommerce',
            'norminvoice-bridge',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings(): void {
        register_setting('norminvoice_settings', self::OPTION_ENDPOINT, [
            'type'              => 'string',
            'sanitize_callback' => [$this, 'sanitize_https_endpoint'],
            'default'           => 'https://norminvoice.eu/api/webhooks/woocommerce',
        ]);
        register_setting('norminvoice_settings', self::OPTION_SECRET, [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ]);
    }

    public function sanitize_https_endpoint(string $url): string {
        $clean = esc_url_raw(trim($url), ['https']);
        if (empty($clean) || strpos($clean, 'https://') !== 0) {
            add_settings_error(
                self::OPTION_ENDPOINT,
                'norminvoice_https_required',
                __('Security Policy: NormInvoice Webhook URL must use HTTPS (TLS).', 'norminvoice')
            );
            return (string) get_option(self::OPTION_ENDPOINT, 'https://norminvoice.eu/api/webhooks/woocommerce');
        }
        return $clean;
    }

    public function render_settings_page(): void {
        if (!current_user_can('manage_woocommerce')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'norminvoice'));
        }
        settings_errors();
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('NormInvoice EU E-Invoicing Bridge (v1.1.0 · HPOS Ready)', 'norminvoice'); ?></h1>
            <p><?php echo esc_html__('Stream completed WooCommerce B2B orders to NormInvoice over signed HTTPS webhooks for automated EN 16931 ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0 e-invoices.', 'norminvoice'); ?></p>
            <form method="post" action="options.php">
                <?php settings_fields('norminvoice_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="norminvoice_webhook_url"><?php echo esc_html__('Webhook URL (HTTPS)', 'norminvoice'); ?></label></th>
                        <td>
                            <input type="url" id="norminvoice_webhook_url" name="<?php echo esc_attr(self::OPTION_ENDPOINT); ?>"
                                   value="<?php echo esc_attr((string) get_option(self::OPTION_ENDPOINT, 'https://norminvoice.eu/api/webhooks/woocommerce')); ?>"
                                   class="regular-text" required pattern="https://.*" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="norminvoice_webhook_secret"><?php echo esc_html__('HMAC-SHA256 Signing Secret', 'norminvoice'); ?></label></th>
                        <td>
                            <input type="password" id="norminvoice_webhook_secret" name="<?php echo esc_attr(self::OPTION_SECRET); ?>"
                                   value="<?php echo esc_attr((string) get_option(self::OPTION_SECRET, '')); ?>"
                                   class="regular-text" autocomplete="new-password" required />
                            <p class="description"><?php echo esc_html__('Copy from NormInvoice Settings -> WooCommerce Bridge.', 'norminvoice'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(__('Save NormInvoice Settings', 'norminvoice')); ?>
            </form>
        </div>
        <?php
    }

    public function add_einvoice_checkout_fields(array $fields): array {
        $fields['billing']['billing_eu_vat_id'] = [
            'label'       => __('EU VAT ID (USt-IdNr. / N° TVA)', 'norminvoice'),
            'placeholder' => 'DE123456789 / FR40303265045',
            'required'    => false,
            'class'       => ['form-row-first'],
            'priority'    => 35,
            'maxlength'   => 18,
        ];
        $fields['billing']['billing_leitweg_id'] = [
            'label'       => __('Buyer Reference / Leitweg-ID (Optional B2G)', 'norminvoice'),
            'placeholder' => '04011000-1234512345-06',
            'required'    => false,
            'class'       => ['form-row-last'],
            'priority'    => 36,
            'maxlength'   => 46,
        ];
        return $fields;
    }

    public function validate_checkout_fields(): void {
        if (!empty($_POST['billing_eu_vat_id'])) {
            $raw = strtoupper(preg_replace('/[\s.-]+/', '', sanitize_text_field(wp_unslash($_POST['billing_eu_vat_id']))));
            if (!preg_match('/^[A-Z]{2}[A-Z0-9]{2,14}$/', $raw)) {
                wc_add_notice(
                    __('Please enter a valid EU VAT ID starting with a 2-letter country code (e.g., DE123456789 or FR40303265045).', 'norminvoice'),
                    'error'
                );
            }
        }
    }

    public function save_einvoice_order_meta_hpos(\WC_Order $order, array $data): void {
        if (!empty($data['billing_eu_vat_id'])) {
            $vat = strtoupper(preg_replace('/[\s.-]+/', '', sanitize_text_field((string) $data['billing_eu_vat_id'])));
            $order->update_meta_data(self::META_VAT_ID, $vat);
        }
        if (!empty($data['billing_leitweg_id'])) {
            $leitweg = sanitize_text_field((string) $data['billing_leitweg_id']);
            $order->update_meta_data(self::META_LEITWEG, $leitweg);
        }
    }

    public function register_order_action(array $actions): array {
        $actions['norminvoice_resend'] = __('Send / Resend E-Invoice to NormInvoice', 'norminvoice');
        return $actions;
    }

    public function handle_manual_resend(\WC_Order $order): void {
        $this->dispatch_order_to_norminvoice($order, true);
    }

    public function dispatch_order_if_unsent(int $order_id): void {
        $order = wc_get_order($order_id);
        if (!$order instanceof \WC_Order) {
            return;
        }
        // Idempotency guard: prevent duplicate invoice dispatch when toggling order status
        if (!empty($order->get_meta(self::META_SENT_FLAG))) {
            return;
        }
        $this->dispatch_order_to_norminvoice($order, false);
    }

    private function dispatch_order_to_norminvoice(\WC_Order $order, bool $force): void {
        $endpoint = (string) get_option(self::OPTION_ENDPOINT);
        $secret   = (string) get_option(self::OPTION_SECRET);
        if (empty($endpoint) || empty($secret) || strpos($endpoint, 'https://') !== 0) {
            return;
        }

        $line_items = [];
        foreach ($order->get_items() as $item_id => $item) {
            if (!$item instanceof \WC_Order_Item_Product) {
                continue;
            }
            $line_items[] = [
                'id'        => (int) $item_id,
                'name'      => $item->get_name(),
                'quantity'  => (float) $item->get_quantity(),
                'subtotal'  => (string) $item->get_subtotal(),
                'total'     => (string) $item->get_total(),
                'total_tax' => (string) $item->get_total_tax(),
            ];
        }

        $payload = [
            'id'             => $order->get_id(),
            'number'         => $order->get_order_number(),
            'date_created'   => $order->get_date_created() ? $order->get_date_created()->date('c') : gmdate('c'),
            'currency'       => $order->get_currency(),
            'total'          => (string) $order->get_total(),
            'total_tax'      => (string) $order->get_total_tax(),
            'payment_method' => $order->get_payment_method(),
            'billing'        => [
                'first_name' => $order->get_billing_first_name(),
                'last_name'  => $order->get_billing_last_name(),
                'company'    => $order->get_billing_company(),
                'address_1'  => $order->get_billing_address_1(),
                'address_2'  => $order->get_billing_address_2(),
                'city'       => $order->get_billing_city(),
                'postcode'   => $order->get_billing_postcode(),
                'country'    => $order->get_billing_country(),
                'email'      => $order->get_billing_email(),
            ],
            'meta_data'      => [
                ['key' => self::META_VAT_ID, 'value' => (string) $order->get_meta(self::META_VAT_ID)],
                ['key' => self::META_LEITWEG, 'value' => (string) $order->get_meta(self::META_LEITWEG)],
            ],
            'line_items'     => $line_items,
        ];

        $json_body = wp_json_encode($payload);
        if (!$json_body) {
            return;
        }
        $signature = base64_encode(hash_hmac('sha256', $json_body, $secret, true));

        $response = wp_remote_post($endpoint, [
            'timeout'   => 12,
            'sslverify' => true,
            'headers'   => [
                'Content-Type'           => 'application/json; charset=utf-8',
                'X-WC-Webhook-Signature' => $signature,
                'X-WC-Webhook-Topic'     => $force ? 'order.manual_resend' : 'order.completed',
            ],
            'body'      => $json_body,
        ]);

        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $order->update_meta_data(self::META_SENT_FLAG, gmdate('c'));
            $order->save();
            $order->add_order_note(__('NormInvoice: EN 16931 E-Invoice generated & GoBD archived.', 'norminvoice'));
        } else {
            $err_detail = is_wp_error($response)
                ? $response->get_error_message()
                : 'HTTP ' . wp_remote_retrieve_response_code($response);
            $order->add_order_note(
                sprintf(__('NormInvoice: Webhook dispatch failed (%s). Use Order Actions -> Resend.', 'norminvoice'), $err_detail)
            );
        }
    }
}

new NormInvoice_Woo_Bridge();
