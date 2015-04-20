/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create the Users table
 */


 /*
  * The Users table stores information about each user.
  *
  * Columns:
  *		UserID - int - A unique identifier for each user.
  *		Username - varchar - The user name associated with the user
  *		dateAdded - datetime - The time at which the user signed up (disabled as of now, meaning not populated).
  *		lastLoginDate - datetime - The time at which the user last logged in.
  */ 

CREATE TABLE `Users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(20) NOT NULL,
  `dateAdded` datetime DEFAULT NULL,
  `lastLoginDate` datetime DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `unique_username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

/* example
insert into `Users`(`UserID`,`Username`,`dateAdded`,`lastLoginDate`) values (1,'StoneMountain64','2015-04-03 21:57:58',null);
insert into `Users`(`UserID`,`Username`,`dateAdded`,`lastLoginDate`) values (15,'Admin',null,null);
*/
