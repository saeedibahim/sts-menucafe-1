<?php
/**
 * Login Endpoint
 * POST /api/auth/login.php
 */

require_once '../config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('طريقة غير مسموحة', 405);
}

// Get request data
$data = getRequestData();

// Validate required fields
if (!validateInput($data, ['email', 'password'])) {
    sendError('البريد الإلكتروني وكلمة المرور مطلوبان');
}

$email = sanitizeInput($data['email']);
$password = $data['password'];

try {
    $pdo = getConnection();

    // Get user by email
    $stmt = $pdo->prepare("SELECT id, email, password_hash FROM admin_users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verify user exists and password is correct
    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    // Set session variables
    $_SESSION['admin_id'] = $user['id'];
    $_SESSION['admin_email'] = $user['email'];
    $_SESSION['last_activity'] = time();

    sendSuccess([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email']
        ]
    ], 'تم تسجيل الدخول بنجاح');

} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    sendError('حدث خطأ أثناء تسجيل الدخول', 500);
}
