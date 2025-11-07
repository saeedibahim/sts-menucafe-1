<?php
/**
 * Upload Image Endpoint
 * POST /api/items/upload.php
 */

require_once '../config.php';

// Require authentication
requireAuth();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('طريقة غير مسموحة', 405);
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
    sendError('الرجاء اختيار صورة');
}

$file = $_FILES['image'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    sendError('حدث خطأ أثناء رفع الصورة');
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    sendError('نوع الملف غير مدعوم. الرجاء رفع صورة (JPG, PNG, GIF, WEBP)');
}

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    sendError('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('item_', true) . '.' . $extension;

// Upload directory
$uploadDir = '../../uploads/';

// Create uploads directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$targetPath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    sendError('فشل رفع الصورة. الرجاء المحاولة مرة أخرى');
}

// Return the file path (relative to root)
$relativePath = 'uploads/' . $filename;

sendSuccess([
    'image_url' => $relativePath,
    'filename' => $filename
], 'تم رفع الصورة بنجاح');
