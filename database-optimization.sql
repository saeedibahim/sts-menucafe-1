-- Database Performance Optimization
-- Run this after installing the main database.sql

-- Add indexes for better query performance
ALTER TABLE items ADD INDEX idx_category_id (category_id);
ALTER TABLE categories ADD INDEX idx_display_order (display_order);

-- Optimize tables
OPTIMIZE TABLE categories;
OPTIMIZE TABLE items;
OPTIMIZE TABLE settings;
OPTIMIZE TABLE admin_users;
