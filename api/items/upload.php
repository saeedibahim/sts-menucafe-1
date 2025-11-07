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

// Generate unique filename (always use .jpg for optimized output)
$filename = uniqid('item_', true) . '.jpg';

// Upload directory
$uploadDir = '../../uploads/';

// Create uploads directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$targetPath = $uploadDir . $filename;

// Optimize and resize image
try {
    // Create image resource from uploaded file
    $sourceImage = null;
    switch ($mimeType) {
        case 'image/jpeg':
        case 'image/jpg':
            $sourceImage = imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($file['tmp_name']);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($file['tmp_name']);
            break;
        case 'image/webp':
            $sourceImage = imagecreatefromwebp($file['tmp_name']);
            break;
    }

    if (!$sourceImage) {
        sendError('فشل معالجة الصورة');
    }

    // Get original dimensions
    $originalWidth = imagesx($sourceImage);
    $originalHeight = imagesy($sourceImage);

    // Maximum dimensions (resize large images)
    $maxWidth = 800;
    $maxHeight = 800;

    // Calculate new dimensions while maintaining aspect ratio
    $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight);

    // Only resize if image is larger than max dimensions
    if ($ratio < 1) {
        $newWidth = round($originalWidth * $ratio);
        $newHeight = round($originalHeight * $ratio);
    } else {
        $newWidth = $originalWidth;
        $newHeight = $originalHeight;
    }

    // Create new image with calculated dimensions
    $optimizedImage = imagecreatetruecolor($newWidth, $newHeight);

    // Preserve transparency for PNG (before converting to JPG)
    $white = imagecolorallocate($optimizedImage, 255, 255, 255);
    imagefill($optimizedImage, 0, 0, $white);

    // Resample (high quality resize)
    imagecopyresampled(
        $optimizedImage, $sourceImage,
        0, 0, 0, 0,
        $newWidth, $newHeight,
        $originalWidth, $originalHeight
    );

    // Save as optimized JPEG (quality 85 = good balance between size and quality)
    if (!imagejpeg($optimizedImage, $targetPath, 85)) {
        imagedestroy($sourceImage);
        imagedestroy($optimizedImage);
        sendError('فشل حفظ الصورة');
    }

    // Free memory
    imagedestroy($sourceImage);
    imagedestroy($optimizedImage);

} catch (Exception $e) {
    error_log('Image optimization error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء معالجة الصورة');
}

// Return the file path (relative to root)
$relativePath = 'uploads/' . $filename;

sendSuccess([
    'image_url' => $relativePath,
    'filename' => $filename
], 'تم رفع الصورة بنجاح');
