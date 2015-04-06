DROP PROCEDURE usp_insertTerm;
CREATE PROCEDURE usp_insertTerm (pUsername varchar(255),
                                  pTerm varchar(255),
                                  pColor varchar(255),
                                  pEnabled bit)
BEGIN
  INSERT INTO Users (Username, dateAdded, lastLoginDate ) VALUES (pUsername, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
    lastLoginDate = CURRENT_TIMESTAMP;
  
  INSERT INTO Terms (UserID, Term, Color, Enabled ) VALUES ((SELECT UserID FROM Users WHERE Username = pUsername LIMIT 0,1), pTerm, pColor, pEnabled)
  ON DUPLICATE KEY UPDATE
    Color = pColor, 
    Enabled = pEnabled;
    
  UPDATE Users
  SET lastLoginDate = CURRENT_TIMESTAMP
  WHERE Username = pUsername; 
END;


CALL usp_insertTerm('Test', 'Alpha1', '#ff0000', 1);
DELETE FROM Terms WHERE Term = 'Alpha1';
DELETE FROM Users WHERE Username = 'Test';