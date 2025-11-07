<?php
/**
 * Check Authentication Endpoint
 * GET /api/auth/check.php
 */

require_once '../config.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('طريقة غير مسموحة', 405);
}

if (isAuthenticated()) {
    sendSuccess([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['admin_id'],
            'email' => $_SESSION['admin_email']
        ]
    ]);
} else {
    sendResponse([
        'success' => true,
        'data' => ['authenticated' => false]
    ]);
}
