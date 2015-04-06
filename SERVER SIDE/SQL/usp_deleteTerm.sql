
DROP PROCEDURE usp_deleteTerm
CREATE PROCEDURE usp_deleteTerm (pUsername varchar(255),
                                  pTerm varchar(255)
                                 )
BEGIN
  DELETE FROM Terms
  WHERE UserID = (SELECT UserID FROM Users WHERE Username = pUsername LIMIT 0,1)
  AND Term = pTerm; 
END


CALL usp_deleteTerm('Admin', 'Zulu');
insert into Terms (UserId, Term, Color, Enabled ) values ( 15, 'Zulu'	, '#737373', 1)