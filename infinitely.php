<?php
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/assets', [
        'methods' => 'GET',
        'callback' => function () {
            global $wp_scripts, $wp_styles;

            // Force WordPress to load queues
            wp_enqueue_scripts();
            wp_print_styles();
            wp_print_scripts();

            $header_styles = [];
            $header_scripts = [];
            $footer_scripts = [];

            // --- Styles (only go in header)
            foreach ($wp_styles->queue as $handle) {
                $src = $wp_styles->registered[$handle]->src ?? '';
                if ($src) {
                    $header_styles[] = esc_url($wp_styles->base_url . $src);
                }
            }

            // --- Scripts (split header/footer)
            foreach ($wp_scripts->queue as $handle) {
                $script = $wp_scripts->registered[$handle];
                if (empty($script->src)) continue;

                $url = esc_url($wp_scripts->base_url . $script->src);
                if (!empty($script->extra['group']) && $script->extra['group'] === 1) {
                    // Footer scripts → group 1
                    $footer_scripts[] = $url;
                } else {
                    // Header scripts
                    $header_scripts[] = $url;
                }
            }

            return [
                'header' => [
                    'styles' => array_values(array_unique($header_styles)),
                    'scripts' => array_values(array_unique($header_scripts)),
                ],
                'footer' => [
                    'scripts' => array_values(array_unique($footer_scripts)),
                ],
            ];
        },
        'permission_callback' => '__return_true',
    ]);
});
