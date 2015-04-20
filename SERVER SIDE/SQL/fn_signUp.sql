/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create fn_signUp
 */


 /*
  * This is meant to be an internal function used by the php service to add a new user into the system, and then log them in.
  * This updates the Login table with the user's ID and token, then calls fn_login. The user will be inserted into the Users table
  * and a default set of 26 terms will be added to the Terms table and associated with the newly added user.
  *
  * Params:
  *		pUsername varchar - the name of the user, as it appears in the Users table
  *		pToken - varchar - The hashed password to be stored and associated with this user
  *		pIPAddress - varchar - The IP Address used to verify the  user is correctly logged in in future authorization requests
  *
  * Returns:
  *		varchar - Returns the session Token on success, a string prefixed with 'FAILURE___' if the user name already exists, and an empty string on failure.
  *
  */ 
DROP FUNCTION IF EXISTS bestclipoftheweek.fn_signUp;
CREATE FUNCTION bestclipoftheweek.`fn_signUp`(pUsername varchar(255),
                                  pToken varchar(255),
                                  pIPAddress varchar(255)) RETURNS varchar(255) CHARSET utf8
    DETERMINISTIC
BEGIN
   DECLARE vID INT;
   DECLARE vRet VARCHAR(255);
   
   /* add new user */
   IF EXISTS(SELECT UserID FROM Users WHERE Username = pUsername) THEN
      RETURN "FAILURE___Username already exists";
   END IF;
   
   INSERT INTO Users (Username, dateAdded, lastLoginDate ) VALUES (pUsername, now(), now());
   
   SET vId = (SELECT MAX(Users.UserID)
            FROM Users 
            WHERE Users.userName = pUsername);
   
   /* populate with default values*/
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Alpha','#ff0000',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Bravo','#ff8000',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Charlie','#fff700',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Delta','#d0ff00',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Echo','#00ff6e',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Foxtrot','#00fff2',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Golf','#009dff',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Hotel','#0040ff',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'India','#8400ff',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Juliet','#d400ff',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Kilo','#ff00ee',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Lima','#ff005d',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Mike','#9e2b55',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'November','#9e2b87',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Oscar','#872b9e',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Papa','#3a2b9e',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Quebec','#2b709e',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Romeo','#2b9e94',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Sierra','#2b9e4d',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Tango','#689e2b',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Uniform','#a9ab4b',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Victor','#bf8e11',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Whiskey','#bf5a11',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'X-ray','#bf1d11',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Yankee','#c78783',1);
    insert into `Terms`(`UserID`,`Term`,`Color`,`Enabled`) values (vID,'Zulu','#737373',1);
   
    /* add to login table */
    INSERT INTO Login (UserID, Token) VALUES(vID, pToken);
    
    /* login */
    SET vRet = (SELECT fn_login(pUsername, pToken, pIPAddress));
    
    RETURN vRet;
   
END;

