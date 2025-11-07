<?php
/**
 * Password Hash Generator
 * This will show you the correct hash for admin123
 */

echo "<h2>🔐 Password Hash Generator</h2>";
echo "<hr>";

// Generate hash for admin123
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "<h3>Generated Hash for: <code>admin123</code></h3>";
echo "<textarea style='width:100%; height:100px; font-family:monospace;'>$hash</textarea>";
echo "<br><br>";

// Test verification
if (password_verify('admin123', $hash)) {
    echo "✅ <strong style='color:green;'>Hash verification successful!</strong><br><br>";
} else {
    echo "❌ <strong style='color:red;'>Hash verification failed!</strong><br><br>";
}

echo "<hr>";
echo "<h3>📋 SQL Query to Update Database:</h3>";
echo "<textarea style='width:100%; height:120px; font-family:monospace;'>";
echo "UPDATE admin_users \n";
echo "SET password_hash = '$hash' \n";
echo "WHERE email = 'admin@cafe.com';";
echo "</textarea>";

echo "<br><br>";
echo "<h3>🎯 Quick Solution - Try This First:</h3>";
echo "<div style='background:#fff3cd; padding:15px; border:2px solid #ffc107; border-radius:5px;'>";
echo "<strong>Login with:</strong><br>";
echo "📧 Email: <code>admin@cafe.com</code><br>";
echo "🔑 Password: <code><strong>password</strong></code> (not admin123)<br><br>";
echo "<em>The original hash was for 'password' not 'admin123'</em>";
echo "</div>";

echo "<br><br>";
echo "<h3>Or Run This Auto-Update:</h3>";

// Auto update if requested
if (isset($_GET['update']) && $_GET['update'] == 'yes') {
    try {
        $pdo = new PDO("mysql:host=localhost;dbname=cafe_menu;charset=utf8mb4", 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE email = 'admin@cafe.com'");
        $stmt->execute([$hash]);

        echo "<div style='background:#d4edda; padding:15px; border:2px solid #28a745; border-radius:5px;'>";
        echo "✅ <strong>Password updated successfully!</strong><br>";
        echo "Now login with:<br>";
        echo "📧 Email: <code>admin@cafe.com</code><br>";
        echo "🔑 Password: <code>admin123</code><br><br>";
        echo "<a href='admin-login.html' style='background:#28a745; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Go to Login Page</a>";
        echo "</div>";
    } catch (PDOException $e) {
        echo "<div style='background:#f8d7da; padding:15px; border:2px solid #dc3545; border-radius:5px;'>";
        echo "❌ Error: " . $e->getMessage();
        echo "</div>";
    }
} else {
    echo "<a href='?update=yes' style='background:#007bff; color:white; padding:15px 30px; text-decoration:none; border-radius:5px; font-size:18px;'>🔄 Click Here to Update Password Now</a>";
}

echo "<br><br><br>";
echo "<div style='background:#f8d7da; padding:15px; border:2px solid #dc3545; border-radius:5px;'>";
echo "⚠️ <strong>IMPORTANT: Delete this file after use!</strong><br>";
echo "File: <code>hash-generator.php</code>";
echo "</div>";
?>
