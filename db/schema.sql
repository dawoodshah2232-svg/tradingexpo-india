-- Trading Expo India 2027 — MySQL schema (cPanel hosting)
-- Import via phpMyAdmin, then set credentials in api/config.php

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref VARCHAR(20) NOT NULL UNIQUE,
  type ENUM('ticket','exhibitor') NOT NULL,
  pass_name VARCHAR(100) NOT NULL DEFAULT '',
  qty INT NOT NULL DEFAULT 1,
  total INT NOT NULL DEFAULT 0,
  name VARCHAR(150) NOT NULL DEFAULT '',
  company VARCHAR(150) NOT NULL DEFAULT '',
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  extra JSON NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('reserved','paid','cancelled') NOT NULL DEFAULT 'reserved',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  audience ENUM('all','ticket','exhibitor') NOT NULL DEFAULT 'all',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin: username `admin`, password `expo2027`
-- (hash generated with PHP password_hash('expo2027', PASSWORD_DEFAULT) — replace after first login)
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2y$10$8K1p/a0dhrm8la0bndqQsu8x3u0Z1mQ4bXv0gXJ9e8nP2mK6vQ2W')
ON DUPLICATE KEY UPDATE username = username;
