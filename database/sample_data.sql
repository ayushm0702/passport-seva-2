USE passport_seva_db;
-- Demo accounts are created with hashed passwords by: cd backend && npm run seed
INSERT IGNORE INTO appointments (slot_date, slot_time, center) VALUES
 (CURDATE() + INTERVAL 3 DAY,'10:00:00','Passport Seva Kendra, Mumbai'),
 (CURDATE() + INTERVAL 3 DAY,'11:00:00','Passport Seva Kendra, Mumbai'),
 (CURDATE() + INTERVAL 4 DAY,'10:00:00','Passport Seva Kendra, Mumbai'),
 (CURDATE() + INTERVAL 4 DAY,'14:00:00','Passport Seva Kendra, Mumbai'),
 (CURDATE() + INTERVAL 5 DAY,'09:30:00','Passport Seva Kendra, Mumbai');
