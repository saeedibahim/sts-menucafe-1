<?php
/**
 * Update Item Endpoint
 * PUT /api/items/update.php
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
if (!validateInput($data, ['id', 'category_id', 'name', 'price'])) {
    sendError('معرف الصنف، الفئة، الاسم، والسعر مطلوبة');
}

$id = intval($data['id']);
$category_id = intval($data['category_id']);
$name = sanitizeInput($data['name']);
$description = isset($data['description']) ? sanitizeInput($data['description']) : '';
$price = floatval($data['price']);
$image_url = isset($data['image_url']) ? sanitizeInput($data['image_url']) : '';

// Validate price
if ($price < 0) {
    sendError('السعر يجب أن يكون رقم موجب');
}

try {
    $pdo = getConnection();

    // Check if item exists
    $stmt = $pdo->prepare("SELECT id FROM items WHERE id = ?");
    $stmt->execute([$id]);

    if (!$stmt->fetch()) {
        sendError('الصنف غير موجود', 404);
    }

    // Check if category exists
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$category_id]);

    if (!$stmt->fetch()) {
        sendError('الفئة غير موجودة', 404);
    }

    // Update item
    $stmt = $pdo->prepare("
        UPDATE items
        SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?
        WHERE id = ?
    ");

    $stmt->execute([$category_id, $name, $description, $price, $image_url, $id]);

    // Get updated item with category info
    $stmt = $pdo->prepare("
        SELECT
            i.*,
            c.name as category_name,
            c.icon as category_icon
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.id = ?
    ");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    sendSuccess(['item' => $item], 'تم تحديث الصنف بنجاح');

} catch (PDOException $e) {
    error_log('Update item error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء تحديث الصنف', 500);
}
