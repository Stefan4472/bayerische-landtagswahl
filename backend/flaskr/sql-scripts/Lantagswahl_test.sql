-- Q1 Sitzverteilung
SELECT * FROM Sitzverteilung;

-- Q2 Mitglieder des Landtages
SELECT * FROM Mitglieder_des_LandtagesUI
ORDER BY nachname;

-- Q3 Stimmkreisuebersicht

-- Wahlbeteiligung
SELECT * FROM WahlbeteiligungUI;

-- den Direktkandidaten
SELECT * FROM DirektkandidatenUI;

-- die prozentuale und absolute Anzahl an Stimmen fuer jede Partei
SELECT * FROM Gesamtstimmen_Partei_StimmkreisUI;


-- Q4 Stimmkreissieger
SELECT * FROM StimmkreisSiegerUi;


-- Q5 Ueberhangmandate
SELECT * FROM UeberhangmandateUI;


-- Q6 Knappste Sieger
SELECT * FROM knappstesiegerui;
-- Knappste Verlierer
SELECT * FROM knappsteverliererui;