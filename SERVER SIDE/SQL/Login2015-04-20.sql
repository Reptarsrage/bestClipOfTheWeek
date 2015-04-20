/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create the Login table
 */


 /*
  * The Login table stores information needed to authorize login requests for all users.
  *
  * Columns:
  *		UserID - int - the unique ID of the user, as it appears in the Users table.
  *		Token - varchar - The hashed password to be stored and associated with this user id.
  *		SessionToken - varchar - The unique identifier used to validate an open session started by logging in.
  *		SessionTokenExp - datetime - The expiration time of the current session token (default is 24 hours from login time).
  *		IP - varchar - The IP Address used to verify the  user is correctly logged in in future authorization requests.
  */ 

CREATE TABLE `Login` (
  `UserID` int(11) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `SessionToken` varchar(255) DEFAULT NULL,
  `SessionTokenExp` datetime DEFAULT NULL,
  `IP` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

