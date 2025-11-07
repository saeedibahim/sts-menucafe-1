<?php
/**
 * Password Reset Script
 * Run this once to set the admin password to: admin123
 */

// Database configuration
$host = 'localhost';
$dbname = 'cafe_menu';
$username = 'root';
$password = '';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Generate new password hash for "admin123"
    $newPassword = 'admin123';
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update admin password
    $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE email = 'admin@cafe.com'");
    $stmt->execute([$hashedPassword]);

    echo "✅ تم تحديث كلمة المرور بنجاح!<br>";
    echo "✅ Password updated successfully!<br><br>";
    echo "📧 Email: admin@cafe.com<br>";
    echo "🔑 Password: admin123<br><br>";
    echo "<strong>يمكنك الآن تسجيل الدخول</strong><br>";
    echo "<strong>You can now login</strong><br><br>";
    echo "<a href='admin-login.html'>اذهب لصفحة تسجيل الدخول / Go to Login Page</a><br><br>";
    echo "<em style='color: red;'>⚠️ احذف هذا الملف بعد الاستخدام / Delete this file after use!</em>";

} catch (PDOException $e) {
    echo "❌ خطأ: " . $e->getMessage();
    echo "<br>❌ Error: " . $e->getMessage();
}
?>
