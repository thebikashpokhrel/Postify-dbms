--select the user by hashing the password
DELIMITER $$

CREATE PROCEDURE SelectUserWithHashedPassword (
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE hashed_password VARCHAR(255);
    SET hashed_password = SHA2(p_password, 256); -- Assuming SHA-256 is used for hashing

    SELECT * FROM users WHERE email = p_email AND password = hashed_password;
END $$

DELIMITER ;
