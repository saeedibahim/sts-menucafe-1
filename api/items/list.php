<?php
/**
 * List Items Endpoint
 * GET /api/items/list.php
 * Optional query parameter: category_id
 */

require_once '../config.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('طريقة غير مسموحة', 405);
}

try {
    $pdo = getConnection();

    // Check if category filter is provided
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;

    if ($categoryId) {
        // Get items for specific category
        $stmt = $pdo->prepare("
            SELECT
                i.id,
                i.category_id,
                i.name,
                i.description,
                i.price,
                i.image_url,
                i.created_at,
                c.name as category_name,
                c.icon as category_icon
            FROM items i
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.category_id = ?
            ORDER BY i.id DESC
        ");
        $stmt->execute([$categoryId]);
    } else {
        // Get all items
        $stmt = $pdo->query("
            SELECT
                i.id,
                i.category_id,
                i.name,
                i.description,
                i.price,
                i.image_url,
                i.created_at,
                c.name as category_name,
                c.icon as category_icon
            FROM items i
            LEFT JOIN categories c ON i.category_id = c.id
            ORDER BY i.id DESC
        ");
    }

    $items = $stmt->fetchAll();

    sendSuccess(['items' => $items]);

} catch (PDOException $e) {
    error_log('List items error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء جلب الأصناف', 500);
}
