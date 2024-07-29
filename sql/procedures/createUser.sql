DELIMITER $$

CREATE PROCEDURE AddUser (
    IN p_firstname VARCHAR(50),
    IN p_lastname VARCHAR(50),
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    OUT user_id INT
)
BEGIN
    -- Insert the user into the users table
    INSERT INTO users (firstname, lastname, username, email, password)
    VALUES (p_firstname, p_lastname, p_username, p_email, p_password);

    -- Set the output parameter to the last inserted ID
    SET user_id = LAST_INSERT_ID();
END $$

DELIMITER ;