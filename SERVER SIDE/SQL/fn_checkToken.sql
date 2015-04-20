/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create fn_checkToken
 */


 /*
  * This is meant to be an internal function used by the php service to retrieve tokens for comparison.
  * The token should match the user's hashed password when the php service compares the two.
  *
  * Params:
  *		pUsername varchar - the name of the user, as it appears in the Users table
  *
  * Returns:
  *		varchar - The token stored for that user.
  *
  */ 
DROP FUNCTION IF EXISTS bestclipoftheweek.fn_checkToken;
CREATE FUNCTION bestclipoftheweek.`fn_checkToken`(pUsername varchar(255)) RETURNS varchar(255) CHARSET utf8
    DETERMINISTIC
BEGIN
  DECLARE vId INT;
  
  SET vId = (SELECT MAX(Users.UserID)
            FROM Users 
            WHERE Users.userName = pUsername);
  
  RETURN (SELECT MAX(Login.Token)
            FROM Login 
            WHERE UserID = vId);    
END;

