<?php
/**
 * Update Category Endpoint
 * PUT /api/categories/update.php
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

// Validate required fields
if (!validateInput($data, ['id', 'name'])) {
    sendError('معرف الفئة والاسم مطلوبان');
}

$id = intval($data['id']);
$name = sanitizeInput($data['name']);
$icon = isset($data['icon']) ? sanitizeInput($data['icon']) : '🍽️';
$display_order = isset($data['display_order']) ? intval($data['display_order']) : 0;

try {
    $pdo = getConnection();

    // Check if category exists
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$id]);

    if (!$stmt->fetch()) {
        sendError('الفئة غير موجودة', 404);
    }

    // Update category
    $stmt = $pdo->prepare("
        UPDATE categories
        SET name = ?, icon = ?, display_order = ?
        WHERE id = ?
    ");

    $stmt->execute([$name, $icon, $display_order, $id]);

    // Get updated category
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $category = $stmt->fetch();

    sendSuccess(['category' => $category], 'تم تحديث الفئة بنجاح');

} catch (PDOException $e) {
    error_log('Update category error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء تحديث الفئة', 500);
}
