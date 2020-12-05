-- Anzahl Erststimme für jeden Kandidat
CREATE OR REPLACE VIEW Kandidat_Stimmkreis_Erststimme AS
SELECT Wahl, Wahlkreis, Stimmkreis, Partei, Kandidat, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.Erststimme s
INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE IsValid = 1
GROUP BY Wahl, Kandidat, Stimmkreis
ORDER BY Wahl, Wahlkreis, Stimmkreis, Anzahl DESC;

-- Anzahl an Zweitstimme für jeden Kandidat
CREATE OR REPLACE VIEW Anzhal_Zweitstimme_Kandidat AS
SELECT Wahl, Wahlkreis, Stimmkreis, Partei, Kandidat, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.Zweitstimme s
INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE isValid = 1
GROUP BY Wahl, Kandidat, Stimmkreis
ORDER BY Wahl, Wahlkreis, Stimmkreis, Partei, Anzahl DESC;

-- Anzahl an alle Zweitstimme für Partei (inklusive Listkandidaten) pro Wahlkreis
CREATE OR REPLACE VIEW Anzhal_Gesamt_Zweitstimme_Partei_Wahlkreis AS
SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM 
	-- Anzahl an Zweitstimme für jeden Kandidat
	(SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM Anzhal_Zweitstimme_Kandidat azs
	GROUP BY Wahl, Wahlkreis, Partei
	UNION ALL 
    -- Anzahl an Zweitstimme nur für Partei
	SELECT Wahl, Wahlkreis, Partei, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.ZweitstimmePartei zp
	INNER JOIN Stimmkreis s ON s.ID = zp.Stimmkreis
	GROUP BY Wahl, Wahlkreis, Partei) Gesamt_Zweitstimmen_Partei_In_Wahlkreis
GROUP BY Wahl, Wahlkreis, Partei
ORDER BY Wahl, Wahlkreis, Anzahl DESC;

-- Gesamtstimmen (inkl. Erst- und Zweitstimmen) für Partei pro Wahlkreis
CREATE OR REPLACE VIEW Anzhal_Gesamtstimmen_Partei_Wahlkreis AS
SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM
	-- Erststimmen für alle Kandidaten einer Partei
	(SELECT Wahl, Wahlkreis, Partei, sum(Anzahl) as Anzahl FROM Kandidat_Stimmkreis_Erststimme
	GROUP BY Wahl, Wahlkreis, Partei
	UNION ALL 
    -- Zweitstimmen einer Partei
	SELECT * FROM Anzhal_Gesamt_Zweitstimme_Partei_Wahlkreis) Gesamt_Stimme_Partei_Pro_Wahlkreis
GROUP BY Wahl, Wahlkreis, Partei
ORDER BY Wahl, Wahlkreis, Anzahl DESC;

-- Summe der Stimmen aller Parteien in Bayern
SET @Summe_Stimmen_aller_Parteien  = (SELECT sum(Anzahl) FROM Anzhal_Gesamtstimmen_Partei_Wahlkreis);

-- Die Zahl der Gesamtstimmen der Partei mit Prozent in Bayern
CREATE OR REPLACE VIEW Gesamtstimmen_Partei_Wahl AS
SELECT Wahl, Partei, sum(Anzahl) as Anzahl_Gesamtstimmen, (sum(Anzahl) / (SELECT sum(Anzahl) FROM Anzhal_Gesamtstimmen_Partei_Wahlkreis)) * 100 as Prozent FROM Anzhal_Gesamtstimmen_Partei_Wahlkreis
GROUP BY Wahl, Partei;

-- Erststimme Gewinner für jeden Stimmkreis (Kandidat mit meisten Anzahl an Erststimmen, dessen Partei mindestens 5 % der Gesamtstimmen in Bayern erreicht hat)
CREATE OR REPLACE VIEW Erststimme_Gewinner_Pro_Stimmkreis AS
SELECT kse.Wahl, kse.Wahlkreis , kse.Stimmkreis, kse.Kandidat, kse.Partei, kse.Anzahl as Erststimme FROM Kandidat_Stimmkreis_Erststimme kse
INNER JOIN (SELECT k.Wahl, k.Stimmkreis, MAX(Anzahl) as Anzahl FROM Kandidat_Stimmkreis_Erststimme k
	INNER JOIN Gesamtstimmen_Partei_Wahl gpw ON gpw.Partei = k.Partei
    -- mindestens 5 % der Gesamtstimmen in Bayern
    WHERE gpw.Prozent >= 5
	GROUP BY k.Wahl, k.Stimmkreis) kse_grouped
ON kse.Wahl = kse_grouped.Wahl AND kse.Anzahl = kse_grouped.Anzahl AND kse.Stimmkreis = kse_grouped.Stimmkreis;