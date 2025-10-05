-- Run this in MySQL (adjust username/password as you like)
CREATE DATABASE IF NOT EXISTS touristguide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'tourist'@'%' IDENTIFIED BY 'tourist_pass';
GRANT ALL PRIVILEGES ON touristguide.* TO 'tourist'@'%';
FLUSH PRIVILEGES;

-- App config: set in application-mysql.properties
-- spring.datasource.url=jdbc:mysql://localhost:3306/touristguide?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
-- spring.datasource.username=tourist
-- spring.datasource.password=tourist_pass
-- spring.jpa.hibernate.ddl-auto=update




