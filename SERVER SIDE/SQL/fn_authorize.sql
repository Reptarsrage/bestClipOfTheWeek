/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create fn_authorize
 */


 /*
  * This is meant to be an internal function used by the php service to verify that a user is correctly logged in.
  * A user is correctly logged in if they meet the following criteria: 
  * 			1. their user name exists in the Users table 
  *				2. their session token is not expired
  * 			3. the session token matches the one associated with their user name in the Login table
  * 			4. their IPAddress matches the one they used to Log-in with.
  *
  * Params:
  *		pUsername varchar - the name of the user, as it appears in the Users table
  *		pSessionToken - varchar - The most recent session token for this user, will have to match the session token stored in Login table in order for the authorization to succeed.
  *		pIPAddress - varchar - The IP Address used to verify the  user is correctly logged in in future authorization requests
  *
  * Returns:
  *		varchar - Returns 1 if user is correctly logged in, returns 0 otherwise.
  *
  */ 
DROP FUNCTION IF EXISTS bestclipoftheweek.fn_authorize;
CREATE FUNCTION bestclipoftheweek.`fn_authorize`(pUsername varchar(255),
                                  pSessionToken varchar(255),
                                  pIPAddress varchar(255)) RETURNS bit(1)
    DETERMINISTIC
BEGIN
  DECLARE vId INT;
  
  SET vId = (SELECT MAX(Users.UserID)
            FROM Users 
            WHERE Users.userName = pUsername);
  
  IF EXISTS(SELECT *
            FROM Login 
            WHERE UserID = vId 
            AND SessionToken = pSessionToken
            AND IP = pIPAddress 
            AND now() < SessionTokenExp) THEN
    RETURN 1;
  END IF;
  
  RETURN 0;
END;

