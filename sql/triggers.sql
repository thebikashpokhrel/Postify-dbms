--Hash the password when the password is updated
DELIMITER $$

CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.password != OLD.password THEN
    SET NEW.password = SHA2(NEW.password, 256);
  END IF;
END $$

DELIMITER ;


--Hash the Password before inserting new user
DELIMITER $$

CREATE TRIGGER before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  SET NEW.password = SHA2(NEW.password, 256);
END $$

DELIMITER ;

-- Generate Random Id for each user insertion with UUID()
DELIMITER $$

CREATE TRIGGER before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  SET NEW.id = UUID();
END $$

DELIMITER ;
