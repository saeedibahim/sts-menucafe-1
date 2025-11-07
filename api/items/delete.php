<?php
/**
 * Delete Item Endpoint
 * DELETE /api/items/delete.php
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
    sendError('معرف الصنف مطلوب');
}

$id = intval($data['id']);

try {
    $pdo = getConnection();

    // Check if item exists
    $stmt = $pdo->prepare("SELECT id, name FROM items WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) {
        sendError('الصنف غير موجود', 404);
    }

    // Delete item
    $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
    $stmt->execute([$id]);

    sendSuccess([], 'تم حذف الصنف بنجاح');

} catch (PDOException $e) {
    error_log('Delete item error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء حذف الصنف', 500);
}
