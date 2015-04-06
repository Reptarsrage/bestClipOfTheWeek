CREATE TABLE `Terms` (
  `TermID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Term` varchar(20) NOT NULL,
  `Color` tinytext CHARACTER SET latin1 NOT NULL,
  `Enabled` bit(1) NOT NULL,
  PRIMARY KEY (`TermID`),
  UNIQUE KEY `unique_term` (`UserID`,`Term`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8;


insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (27,1,'Alpha','#ff0000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (28,1,'Bravo','#ff8000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (29,1,'Charlie','#fff700',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (30,1,'Delta','#d0ff00',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (31,1,'Echo','#00ff6e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (32,1,'Foxtrot','#00fff2',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (33,1,'Golf','#009dff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (34,1,'Hotel','#0040ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (35,1,'India','#8400ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (36,1,'Juliet','#d400ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (37,1,'Kilo','#ff00ee',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (38,1,'Lima','#ff005d',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (39,1,'Mike','#9e2b55',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (40,1,'November','#9e2b87',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (41,1,'Oscar','#872b9e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (42,1,'Papa','#3a2b9e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (43,1,'Quebec','#2b709e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (44,1,'Romeo','#2b9e94',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (45,1,'Sierra','#2b9e4d',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (46,1,'Tango','#689e2b',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (47,1,'Uniform','#a9ab4b',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (48,1,'Victor','#bf8e11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (49,1,'Whiskey','#bf5a11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (50,1,'X-ray','#bf1d11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (51,1,'Yankee','#c78783',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (52,1,'Zulu','#737373',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (87,13,'Alpha1','#ff0000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (89,2,'Alpha','#ff0000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (90,2,'Bravo','#ff8000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (91,2,'Charlie','#fff700',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (92,2,'Delta','#d0ff00',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (93,2,'Echo','#00ff6e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (94,2,'Foxtrot','#00fff2',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (95,2,'Golf','#009dff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (96,2,'Hotel','#0040ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (97,2,'India','#8400ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (98,2,'Juliet','#d400ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (99,2,'Kilo','#ff00ee',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (100,2,'Lima','#ff005d',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (101,2,'Mike','#9e2b55',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (102,2,'November','#9e2b87',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (103,2,'Oscar','#872b9e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (104,2,'Papa','#3a2b9e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (105,2,'Quebec','#2b709e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (106,2,'Romeo','#2b9e94',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (107,2,'Sierra','#2b9e4d',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (108,2,'Tango','#689e2b',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (109,2,'Uniform','#a9ab4b',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (110,2,'Victor','#bf8e11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (111,2,'Whiskey','#bf5a11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (112,2,'X-ray','#bf1d11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (113,2,'Yankee','#c78783',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (114,2,'Zulu','#737373',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (115,15,'Alpha','#ff0000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (116,15,'Bravo','#ff8000',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (117,15,'Charlie','#fff700',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (118,15,'Delta','#d0ff00',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (119,15,'Echo','#00ff6e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (120,15,'Foxtrot','#00fff15',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (121,15,'Golf','#009dff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (122,15,'Hotel','#0040ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (123,15,'India','#8400ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (124,15,'Juliet','#d400ff',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (125,15,'Kilo','#ff00ee',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (126,15,'Lima','#ff005d',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (127,15,'Mike','#9e15b55',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (128,15,'November','#9e15b87',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (129,15,'Oscar','#8715b9e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (130,15,'Papa','#3a15b9e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (131,15,'Quebec','#15b709e',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (132,15,'Romeo','#15b9e94',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (133,15,'Sierra','#15b9e4d',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (134,15,'Tango','#689e15b',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (135,15,'Uniform','#a9ab4b',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (136,15,'Victor','#bf8e11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (137,15,'Whiskey','#bf5a11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (138,15,'X-ray','#bf1d11',1);
insert into `Terms`(`TermID`,`UserID`,`Term`,`Color`,`Enabled`) values (139,15,'Yankee','#c78783',1);

