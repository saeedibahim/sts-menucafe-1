<?php
/**
 * Database Configuration
 * Cafe Menu System
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set response headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'cafe_menu');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Session timeout (30 minutes)
define('SESSION_TIMEOUT', 1800);

/**
 * Get database connection
 */
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في الاتصال بقاعدة البيانات'
        ]);
        exit();
    }
}

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendResponse([
        'success' => false,
        'message' => $message
    ], $statusCode);
}

/**
 * Send success response
 */
function sendSuccess($data = [], $message = '') {
    $response = ['success' => true];
    if ($message) {
        $response['message'] = $message;
    }
    if (!empty($data)) {
        $response['data'] = $data;
    }
    sendResponse($response);
}

/**
 * Validate input
 */
function validateInput($data, $required = []) {
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            return false;
        }
    }
    return true;
}

/**
 * Sanitize input
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    if (!isset($_SESSION['admin_id'])) {
        return false;
    }

    // Check session timeout
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
        session_unset();
        session_destroy();
        return false;
    }

    // Update last activity time
    $_SESSION['last_activity'] = time();

    return true;
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isAuthenticated()) {
        sendError('غير مصرح. الرجاء تسجيل الدخول', 401);
    }
}

/**
 * Get request body as JSON
 */
function getRequestData() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ? $data : [];
}
