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

-- die Entwicklung der Stimmen in 2018 im Vergleich zum 2013
SELECT * FROM Entwicklung_Stimmen_2018_zum_2013UI;


-- Q4 Stimmkreissieger
SELECT * FROM StimmkreisSiegerUi;


-- Q5 Ueberhangmandate
SELECT * FROM UeberhangmandateUI;


-- Q6 Knappste Sieger
SELECT * FROM knappstesiegerui;
-- Knappste Verlierer
SELECT * FROM knappsteverliererui;


-- Q7 Stimmkreisübersicht (Einzelstimmen)
-- Wahlbeteiligung
SELECT * FROM Wahlbeteiligung_EinzelstimmenUI;

-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
SELECT * FROM Gesamtstimmen_Partei_Stimmkreis_EinzelstimmenUI;

--Gewaehlten Direktkandidaten
SELECT * FROM direktkandidaten_einzelstimmenui;


-- Wahlzettel
SELECT * FROM erststimmewahlzettel(2018, 95);

SELECT * FROM zweitstimmeWahlzettel(2018, 94);


--Aufgabe2 Ausgedachte Analysen

-- 10 beste Stimmkreise für alle Parteien, wo sie größte prozentuale Anzahl an Stimmen haben.
SELECT * FROM beste_stimmkreise_parteiui;