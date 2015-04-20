/*
 * Justin Robb
 * 4/20/2015
 * bestClipOfTheWeek
 * Script to create usp_insertTerm
 */


 /*
  * This is meant to be an internal function used by the php service to insert a new term, and update existing terms in the Terms table.
  * If given a term that already exists for the given user, the proc will update this term, else the term will be added.
  *
  * Params:
  *		pUsername varchar - the name of the user, as it appears in the Users table
  *		Term - varchar - The stored term, which is a string literal used for the search through youtube comments. Max length of 20 chars.
  *		Color - tinytext - The color to associate with the term. Expects a valid hex color. 
  *		Enabled - bit - A single bit to toggle if the term should be enabled, meaning used in the search results. 1 = enabled, 0 = disabled.
  */ 
DROP PROCEDURE usp_insertTerm;
CREATE PROCEDURE usp_insertTerm (pUsername varchar(255),
                                  pTerm varchar(255),
                                  pColor varchar(255),
                                  pEnabled bit)
BEGIN
  INSERT INTO Users (Username, dateAdded, lastLoginDate ) VALUES (pUsername, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
    lastLoginDate = CURRENT_TIMESTAMP;
  
  INSERT INTO Terms (UserID, Term, Color, Enabled ) VALUES ((SELECT UserID FROM Users WHERE Username = pUsername LIMIT 0,1), pTerm, pColor, pEnabled)
  ON DUPLICATE KEY UPDATE
    Color = pColor, 
    Enabled = pEnabled;
    
  UPDATE Users
  SET lastLoginDate = CURRENT_TIMESTAMP
  WHERE Username = pUsername; 
END;

/* example
CALL usp_insertTerm('Test', 'Alpha1', '#ff0000', 1);
DELETE FROM Terms WHERE Term = 'Alpha1';
DELETE FROM Users WHERE Username = 'Test';
*/