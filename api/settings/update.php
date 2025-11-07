<?php
/**
 * Update Settings Endpoint
 * PUT /api/settings/update.php
 */

require_once '../config.php';

// Require authentication
requireAuth();

// Only accept PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('طريقة غير مسموحة', 405);
}

// Get request data
$data = getRequestData();

$cafe_name = isset($data['cafe_name']) ? sanitizeInput($data['cafe_name']) : '';
$logo_url = isset($data['logo_url']) ? sanitizeInput($data['logo_url']) : '';
$whatsapp = isset($data['whatsapp']) ? sanitizeInput($data['whatsapp']) : '';
$instagram = isset($data['instagram']) ? sanitizeInput($data['instagram']) : '';

try {
    $pdo = getConnection();

    // Check if settings exist
    $stmt = $pdo->query("SELECT id FROM settings LIMIT 1");
    $existing = $stmt->fetch();

    if ($existing) {
        // Update existing settings
        $stmt = $pdo->prepare("
            UPDATE settings
            SET cafe_name = ?, logo_url = ?, whatsapp = ?, instagram = ?
            WHERE id = ?
        ");
        $stmt->execute([$cafe_name, $logo_url, $whatsapp, $instagram, $existing['id']]);
    } else {
        // Insert new settings
        $stmt = $pdo->prepare("
            INSERT INTO settings (cafe_name, logo_url, whatsapp, instagram)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$cafe_name, $logo_url, $whatsapp, $instagram]);
    }

    // Get updated settings
    $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
    $settings = $stmt->fetch();

    sendSuccess(['settings' => $settings], 'تم تحديث الإعدادات بنجاح');

} catch (PDOException $e) {
    error_log('Update settings error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء تحديث الإعدادات', 500);
}
