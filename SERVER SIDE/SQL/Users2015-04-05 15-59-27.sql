CREATE TABLE `Users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(20) NOT NULL,
  `dateAdded` datetime DEFAULT NULL,
  `lastLoginDate` datetime DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `unique_username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;


insert into `Users`(`UserID`,`Username`,`dateAdded`,`lastLoginDate`) values (1,'StoneMountain64','2015-04-03 21:57:58',null);
insert into `Users`(`UserID`,`Username`,`dateAdded`,`lastLoginDate`) values (15,'Admin',null,null);

