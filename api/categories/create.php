<?php
/**
 * Create Category Endpoint
 * POST /api/categories/create.php
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
if (!validateInput($data, ['name'])) {
    sendError('اسم الفئة مطلوب');
}

$name = sanitizeInput($data['name']);
$icon = isset($data['icon']) ? sanitizeInput($data['icon']) : '🍽️';
$display_order = isset($data['display_order']) ? intval($data['display_order']) : 0;

try {
    $pdo = getConnection();

    // If display_order is 0 or not set, set it to max + 1
    if ($display_order === 0) {
        $stmt = $pdo->query("SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM categories");
        $result = $stmt->fetch();
        $display_order = $result['next_order'];
    }

    // Insert new category
    $stmt = $pdo->prepare("
        INSERT INTO categories (name, icon, display_order)
        VALUES (?, ?, ?)
    ");

    $stmt->execute([$name, $icon, $display_order]);

    $categoryId = $pdo->lastInsertId();

    // Get the created category
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();

    sendSuccess(['category' => $category], 'تم إضافة الفئة بنجاح');

} catch (PDOException $e) {
    error_log('Create category error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء إضافة الفئة', 500);
}
