/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create fn_login
 */


 /*
  * This is meant to be an internal function used by the php service to create a log-in session for the user.
  * This updates the Login table with the user's latest session ID, IP Address, and session token. 
  * The session token is set to expire 24 hours from the time of login.
  * It also updates the Users table with the latest log-in date. 
  *
  * Params:
  *		pUsername varchar - the name of the user, as it appears in the Users table
  *		pToken - varchar - The hashed password to be stored and associated with this user
  *		pIPAddress - varchar - The IP Address used to verify the  user is correctly logged in in future authorization requests
  *
  * Returns:
  *		varchar - Returns the session Token on success, and an empty string on failure.
  *
  */ 
DROP FUNCTION IF EXISTS bestclipoftheweek.fn_login;
CREATE FUNCTION bestclipoftheweek.`fn_login`(pUsername varchar(255),
                                  pToken varchar(255),
                                  pIPAddress varchar(255)) RETURNS varchar(255) CHARSET utf8
    DETERMINISTIC
BEGIN
  DECLARE vSessionToken VARCHAR(255);
  DECLARE vId INT;
  
  SET vId = (SELECT MAX(Users.UserID)
            FROM Users 
            WHERE Users.userName = pUsername);
  
  IF NOT EXISTS(SELECT *
            FROM Login 
            WHERE UserID = vId 
            AND Token = pToken) THEN
    RETURN "";
  END IF;
  
  SET vSessionToken = (SELECT MAX(Login.SessionToken)
            FROM Login 
            WHERE UserID = vId 
            AND Login.SessionTokenExp > now()
            AND Login.Token = pToken);
  
  IF (vSessionToken IS NULL) THEN
    SET vSessionToken = UUID();
  END IF;

  IF vId IS NOT NULL AND vSessionToken IS NOT NULL THEN
      UPDATE Login
      SET Login.SessionToken = vSessionToken,
          Login.SessionTokenExp = DATE_ADD(now(),INTERVAL 24 HOUR),
          Login.IP = pIPAddress
      WHERE Login.UserID = vId;
      
      RETURN vSessionToken;
  ELSE
    RETURN "";
  END IF;
END;

