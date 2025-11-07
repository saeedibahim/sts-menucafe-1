<?php
/**
 * Delete Category Endpoint
 * DELETE /api/categories/delete.php
 */

require_once '../config.php';

// Require authentication
requireAuth();

// Only accept DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('طريقة غير مسموحة', 405);
}

// Get request data
$data = getRequestData();

// Validate required fields
if (!validateInput($data, ['id'])) {
    sendError('معرف الفئة مطلوب');
}

$id = intval($data['id']);

try {
    $pdo = getConnection();

    // Check if category exists and get item count
    $stmt = $pdo->prepare("
        SELECT
            c.id,
            c.name,
            (SELECT COUNT(*) FROM items WHERE category_id = c.id) as item_count
        FROM categories c
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $category = $stmt->fetch();

    if (!$category) {
        sendError('الفئة غير موجودة', 404);
    }

    // Delete category (CASCADE will automatically delete items)
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);

    $message = $category['item_count'] > 0
        ? "تم حذف الفئة و {$category['item_count']} صنف بنجاح"
        : 'تم حذف الفئة بنجاح';

    sendSuccess([
        'deleted_items_count' => $category['item_count']
    ], $message);

} catch (PDOException $e) {
    error_log('Delete category error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء حذف الفئة', 500);
}
