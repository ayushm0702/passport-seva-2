CREATE DATABASE IF NOT EXISTS passport_seva_db CHARACTER SET utf8mb4;
USE passport_seva_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_created (created_at)
);

CREATE TABLE user_profiles (
  user_id INT PRIMARY KEY,
  dob DATE, gender ENUM('Male','Female','Other'),
  address VARCHAR(255), city VARCHAR(60), state VARCHAR(60), pincode CHAR(6),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL
);

CREATE TABLE officer_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  employee_code VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE passport_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(20) UNIQUE,
  user_id INT NOT NULL,
  application_type ENUM('New','Reissue') NOT NULL,
  service_mode ENUM('Normal','Tatkaal') NOT NULL DEFAULT 'Normal',
  status ENUM('Draft','Submitted','Appointment Scheduled','Under Verification',
              'Documents Required','Verification Completed',
              'Approved (Simulated)','Rejected (Simulated)') NOT NULL DEFAULT 'Draft',
  given_name VARCHAR(60) NOT NULL, surname VARCHAR(60) NOT NULL,
  dob DATE NOT NULL, gender ENUM('Male','Female','Other') NOT NULL,
  birth_place VARCHAR(80) NOT NULL, address VARCHAR(255) NOT NULL,
  old_passport_no VARCHAR(15) NULL,
  officer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES officer_users(id) ON DELETE SET NULL,
  INDEX idx_app_status (status), INDEX idx_app_user (user_id), INDEX idx_app_officer (officer_id)
);

CREATE TABLE application_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  doc_type VARCHAR(40) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(60) NOT NULL,
  size_bytes INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_date DATE NOT NULL, slot_time TIME NOT NULL,
  center VARCHAR(80) NOT NULL,
  application_id INT NULL UNIQUE,
  FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE SET NULL,
  UNIQUE KEY uq_slot (slot_date, slot_time, center),
  INDEX idx_slot_date (slot_date)
);

CREATE TABLE verification_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL, officer_id INT NOT NULL,
  status ENUM('Pending','Completed','Correction Required') NOT NULL DEFAULT 'Pending',
  remarks TEXT,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES officer_users(id)
);

CREATE TABLE application_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  old_status VARCHAR(40), new_status VARCHAR(40) NOT NULL,
  changed_by_role ENUM('citizen','officer','admin','system') NOT NULL,
  changed_by_id INT NULL, note VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE CASCADE,
  INDEX idx_hist_app (application_id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL, message VARCHAR(255) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
);
