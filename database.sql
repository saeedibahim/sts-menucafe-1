-- Cafe Menu System Database Schema
-- Created for Digital Menu Solution

-- Drop tables if they exist (for clean installation)
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS admin_users;

-- Categories Table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT '🍽️',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items Table
CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cafe_name VARCHAR(100) DEFAULT 'مقهى الأزرق',
    logo_url VARCHAR(500),
    whatsapp VARCHAR(20),
    instagram VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Users Table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Admin User
-- Email: admin@cafe.com
-- Password: admin123
INSERT INTO admin_users (email, password_hash) VALUES
('admin@cafe.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert Default Settings
INSERT INTO settings (cafe_name, logo_url, whatsapp, instagram) VALUES
('مقهى الأزرق', '', '+966500000000', '@cafe_example');

-- Insert Default Categories
INSERT INTO categories (name, icon, display_order) VALUES
('مشروبات ساخنة', '☕', 1),
('مشروبات باردة', '🧊', 2),
('معجنات', '🥐', 3),
('حلويات', '🍰', 4);

-- Insert Sample Items
INSERT INTO items (category_id, name, description, price, image_url) VALUES
-- Hot Drinks
(1, 'قهوة أمريكية', 'قهوة أمريكية كلاسيكية مع نكهة قوية ومميزة', 12.00, ''),
(1, 'كابتشينو', 'إسبريسو مع حليب مخفوق ورغوة كريمية', 15.00, ''),
(1, 'لاتيه', 'إسبريسو مع حليب ساخن وطبقة خفيفة من الرغوة', 14.00, ''),
(1, 'شاي أخضر', 'شاي أخضر طازج ومنعش', 10.00, ''),

-- Cold Drinks
(2, 'آيس لاتيه', 'لاتيه بارد مع مكعبات ثلج', 16.00, ''),
(2, 'فرابتشينو', 'مشروب بارد ومخفوق بالثلج مع الكريمة', 18.00, ''),
(2, 'عصير برتقال طازج', 'عصير برتقال طبيعي 100%', 13.00, ''),
(2, 'موهيتو', 'مشروب منعش بالنعناع والليمون', 15.00, ''),

-- Pastries
(3, 'كرواسون', 'كرواسون فرنسي طازج ومقرمش', 8.00, ''),
(3, 'كرواسون بالشوكولاتة', 'كرواسون محشو بالشوكولاتة الفاخرة', 10.00, ''),
(3, 'مافن التوت', 'مافن طازج بحبات التوت الأزرق', 9.00, ''),
(3, 'بان أو شوكولا', 'معجنات فرنسية بالشوكولاتة', 11.00, ''),

-- Desserts
(4, 'تشيز كيك', 'تشيز كيك كريمي بقاعدة البسكويت', 20.00, ''),
(4, 'تيراميسو', 'حلى إيطالي كلاسيكي بالقهوة والماسكاربوني', 22.00, ''),
(4, 'براونيز بالآيس كريم', 'براونيز بالشوكولاتة مع كرة آيس كريم الفانيليا', 18.00, ''),
(4, 'كريم بروليه', 'حلى فرنسي كلاسيكي بطبقة الكراميل المقرمشة', 19.00, '');
