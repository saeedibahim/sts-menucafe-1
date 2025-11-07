<?php
/**
 * Logout Endpoint
 * POST /api/auth/logout.php
 */

require_once '../config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('طريقة غير مسموحة', 405);
}

// Clear all session variables
$_SESSION = [];

// Destroy the session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Destroy the session
session_destroy();

sendSuccess([], 'تم تسجيل الخروج بنجاح');
