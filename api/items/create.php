<?php
/**
 * Create Item Endpoint
 * POST /api/items/create.php
 */

require_once '../config.php';

// Require authentication
requireAuth();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('طريقة غير مسموحة', 405);
}

// Get request data
$data = getRequestData();

// Validate required fields
if (!validateInput($data, ['category_id', 'name', 'price'])) {
    sendError('الفئة، الاسم، والسعر مطلوبة');
}

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

    // Check if category exists
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$category_id]);

    if (!$stmt->fetch()) {
        sendError('الفئة غير موجودة', 404);
    }

    // Insert new item
    $stmt = $pdo->prepare("
        INSERT INTO items (category_id, name, description, price, image_url)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([$category_id, $name, $description, $price, $image_url]);

    $itemId = $pdo->lastInsertId();

    // Get the created item with category info
    $stmt = $pdo->prepare("
        SELECT
            i.*,
            c.name as category_name,
            c.icon as category_icon
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.id = ?
    ");
    $stmt->execute([$itemId]);
    $item = $stmt->fetch();

    sendSuccess(['item' => $item], 'تم إضافة الصنف بنجاح');

} catch (PDOException $e) {
    error_log('Create item error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء إضافة الصنف', 500);
}
