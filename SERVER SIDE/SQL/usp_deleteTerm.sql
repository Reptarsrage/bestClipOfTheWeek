/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create usp_deleteTerm
 */


 /*
  * This is meant to be an internal function used by the php service to delete a term from the Terms table.
  * If given a term that doesn't exist, proc does nothing.
  *
  * Params:
  *		pUsername varchar - the name of the user, as it appears in the Users table
  *		Term - varchar - The stored term, which is a string literal used for the search through youtube comments. Max length of 20 chars.
  */ 
DROP PROCEDURE usp_deleteTerm
CREATE PROCEDURE usp_deleteTerm (pUsername varchar(255),
                                  pTerm varchar(255)
                                 )
BEGIN
  DELETE FROM Terms
  WHERE UserID = (SELECT UserID FROM Users WHERE Username = pUsername LIMIT 0,1)
  AND Term = pTerm; 
END

/* example
CALL usp_deleteTerm('Admin', 'Zulu');
insert into Terms (UserId, Term, Color, Enabled ) values ( 15, 'Zulu'	, '#737373', 1)
*/