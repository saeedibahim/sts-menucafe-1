<?php
/**
 * List Categories Endpoint
 * GET /api/categories/list.php
 */

require_once '../config.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('طريقة غير مسموحة', 405);
}

try {
    $pdo = getConnection();

    // Get all categories ordered by display_order
    $stmt = $pdo->query("
        SELECT
            id,
            name,
            icon,
            display_order,
            created_at,
            (SELECT COUNT(*) FROM items WHERE category_id = categories.id) as item_count
        FROM categories
        ORDER BY display_order ASC, id ASC
    ");

    $categories = $stmt->fetchAll();

    sendSuccess(['categories' => $categories]);

} catch (PDOException $e) {
    error_log('List categories error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء جلب الفئات', 500);
}
