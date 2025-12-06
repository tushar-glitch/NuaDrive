CREATE DATABASE IF NOT EXISTS nua_file_share;
USE nua_file_share;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL, -- Original name (e.g., "report.pdf")
    r2_key VARCHAR(255) NOT NULL,   -- Unique storage key
    file_type VARCHAR(50),          -- Mime type or extension
    size BIGINT,                    -- Size in bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- We will add sharing tables later
