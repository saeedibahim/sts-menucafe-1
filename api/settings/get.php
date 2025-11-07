<?php
/**
 * Get Settings Endpoint
 * GET /api/settings/get.php
 */

require_once '../config.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('طريقة غير مسموحة', 405);
}

// Set cache headers (cache for 10 minutes - settings change rarely)
setCacheHeaders(600);

try {
    $pdo = getConnection();

    // Get settings (there should be only one row)
    $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
    $settings = $stmt->fetch();

    // If no settings exist, create default
    if (!$settings) {
        $stmt = $pdo->query("
            INSERT INTO settings (cafe_name, logo_url, whatsapp, instagram)
            VALUES ('مقهى الأزرق', '', '+966500000000', '@cafe_example')
        ");

        $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
        $settings = $stmt->fetch();
    }

    sendSuccess(['settings' => $settings]);

} catch (PDOException $e) {
    error_log('Get settings error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء جلب الإعدادات', 500);
}
