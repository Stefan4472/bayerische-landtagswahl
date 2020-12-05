-- Anzahl Erststimme für jeden Kandidat
CREATE OR REPLACE VIEW Kandidat_Stimmkreis_Erststimme AS
SELECT Wahl, Wahlkreis, Stimmkreis, Partei, Kandidat, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.Erststimme s
INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE IsValid = 1
GROUP BY Wahl, Kandidat, Stimmkreis
ORDER BY Wahl, Wahlkreis, Stimmkreis, Anzahl DESC;

-- TODO: implement 5% check for each candidat
-- Erststimme Gewinner für jeden Stimmkreis mit der Anzahl Stimme
CREATE OR REPLACE VIEW Erststimme_Gewinner_Stimmkreis AS
SELECT kse.Wahl, kse.Kandidat, kse.Stimmkreis, kse.Anzahl FROM Kandidat_Stimmkreis_Erststimme kse
INNER JOIN (SELECT Wahl, Stimmkreis, MAX(Anzahl) as Anzahl FROM Kandidat_Stimmkreis_Erststimme GROUP BY Wahl, Stimmkreis) kse_grouped
ON kse.Wahl = kse_grouped.Wahl AND kse.Anzahl = kse_grouped.Anzahl AND kse.Stimmkreis = kse_grouped.Stimmkreis;

-- Anzahl an Zweitstimme für jeden Kandidat
CREATE OR REPLACE VIEW Anzhal_Zweitstimme_Kandidat AS
SELECT Wahl, Wahlkreis, Stimmkreis, Partei, Kandidat, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.Zweitstimme s
INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE isValid = 1
GROUP BY Wahl, Kandidat, Stimmkreis
ORDER BY Wahl, Wahlkreis, Stimmkreis, Partei, Anzahl DESC;

-- Anzahl an Zweitstimme nur für Partei pro Wahlkreis
CREATE OR REPLACE VIEW Anzhal_Zweitstimme_Partei_Wahlkreis AS
SELECT Wahl, Wahlkreis, Partei, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.ZweitstimmePartei zp
INNER JOIN Stimmkreis s ON s.ID = zp.Stimmkreis
GROUP BY Wahl, Wahlkreis, Partei
ORDER BY Wahl, Wahlkreis, Partei;

-- Anzahl an alle Zweitstimme für Partei (inklusive Listkandidaten) pro Wahlkreis
CREATE OR REPLACE VIEW Anzhal_Gesamt_Zweitstimme_Partei_Wahlkreis AS
SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM 
	(SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM Anzhal_Zweitstimme_Kandidat azs
	GROUP BY Wahl, Wahlkreis, Partei
	UNION ALL 
	SELECT * FROM Anzhal_Zweitstimme_Partei_Wahlkreis azpw) Gesamt_Zweitstimmen_Partei_In_Wahlkreis
GROUP BY Wahl, Wahlkreis, Partei
ORDER BY Wahl, Wahlkreis, Anzahl DESC;

-- Gesamtstimmen für Partei (inklusive Listkandidaten) pro Wahlkreis
CREATE OR REPLACE VIEW Anzhal_Gesamt_Stimme_Partei_Wahlkreis AS
SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM
	(SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM Kandidat_Stimmkreis_Erststimme
	GROUP BY Wahl, Wahlkreis, Partei
	UNION ALL 
	SELECT * FROM Anzhal_Gesamt_Zweitstimme_Partei_Wahlkreis) Gesamt_Stimme_Partei_Pro_Wahlkreis
GROUP BY Wahl, Wahlkreis, Partei
ORDER BY Wahl, Wahlkreis, Anzahl DESC;