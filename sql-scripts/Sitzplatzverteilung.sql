USE bayerische_landtagswahl;
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

-- Anzahl an Stimmen und Sitze der Partei (über 5 % in Bayern) pro Wahlkreis
CREATE OR REPLACE VIEW Gesamtstimmen_und_Sitze_Partei_5Prozent_Wahlkreis AS
WITH Gesamtstimmen_Partei_5Prozent AS
-- Parteien die mehr als 5 % der Gesamtstimmen in Bayern haben
		(SELECT t1.Wahl, t1.Wahlkreis, t1.Partei, t1.Anzahl as Stimmenzahl FROM Anzhal_Gesamtstimmen_Partei_Wahlkreis t1
		-- mindestens 5 % der Gesamtstimmen in Bayern
		INNER JOIN (SELECT * FROM Gesamtstimmen_Partei_Wahl WHERE Prozent >= 5) partei_mit_5proz
		ON partei_mit_5proz.Partei = t1.Partei),
-- Absolute Stimmenzahl einer Partei wird durch die Gesamtzahl der Stimmen aller Parteien dividiert
	Anzhal_Gesamtstimmen_Partei_5Prozent_Wahlkreis AS
		(SELECT Wahl, Wahlkreis, Partei, Stimmenzahl, Stimmenzahl / (SELECT sum(Stimmenzahl) FROM Gesamtstimmen_Partei_5Prozent t2
		WHERE t2.Wahlkreis = t3.Wahlkreis AND t2.Wahl = t3.Wahl GROUP BY Wahl, Wahlkreis) as Prozent_In_Wahlkreis
		FROM Gesamtstimmen_Partei_5Prozent t3),
-- Berechnen Anzhal an Sitze pro Partei in Wahlkreis
	Gesamtstimmen_und_Sitze_Partei AS 
		(SELECT agp.Wahl, agp.Wahlkreis, agp.Partei, agp.Stimmenzahl, agp.Prozent_In_Wahlkreis * 100 as Prozent, ROUND(agp.Prozent_In_Wahlkreis * (SELECT w.Direktmandate + w.Listenmandate FROM Wahlkreis w WHERE agp.Wahlkreis = w.ID)) as Sitze
		FROM Anzhal_Gesamtstimmen_Partei_5Prozent_Wahlkreis agp),
-- Berechnen Anzahl Direktmandate und Listmandate
	Mandate_Partei AS
		(SELECT agz.Wahl, agz.Wahlkreis, agz.Partei, agz.Stimmenzahl, agz.Prozent, agz.Sitze, 
				IFNULL(Erststimme_Gewinner_Pro_Partei.Anzahl_Gewinner, 0) as Direktmandate,
				agz.Sitze - IFNULL(Erststimme_Gewinner_Pro_Partei.Anzahl_Gewinner, 0) as Listmandate
		FROM Gesamtstimmen_und_Sitze_Partei agz
		LEFT JOIN (SELECT Wahl, Wahlkreis, Partei, count(Kandidat) as Anzahl_Gewinner FROM Erststimme_Gewinner_Pro_Stimmkreis
					GROUP BY Wahl, Wahlkreis, Partei) Erststimme_Gewinner_Pro_Partei
		ON Erststimme_Gewinner_Pro_Partei.Wahl = agz.Wahl
			AND Erststimme_Gewinner_Pro_Partei.Wahlkreis = agz.Wahlkreis
			AND Erststimme_Gewinner_Pro_Partei.Partei = agz.Partei),
-- Berechnen Überhangmandaten Ratio für alle Wahlkreise.
	Ueberhangsmandate_Verhaeltnis AS 
		(SELECT Wahl, Wahlkreis, MAX(Direktmandate / Sitze) as Ueberhangsmandate_Verhaeltnis FROM Mandate_Partei
		GROUP BY Wahl, Wahlkreis
		HAVING Ueberhangsmandate_Verhaeltnis > 1)
-- Berechnen Sitze für alle Parteien wenn es zu Überhangmandaten kommt.
SELECT mp.Wahl, mp.Wahlkreis, mp.Partei, mp.Stimmenzahl, mp.Prozent, mp.Sitze, 
		ROUND(mp.Sitze * IFNULL(uv.Ueberhangsmandate_Verhaeltnis, 1)) as Ueberhangsmandate_Sitze,
        mp.Direktmandate,
		ROUND(mp.Sitze * IFNULL(uv.Ueberhangsmandate_Verhaeltnis, 1)) - mp.Direktmandate as Listmandate
FROM Mandate_Partei mp
LEFT JOIN Ueberhangsmandate_Verhaeltnis uv
ON mp.Wahl = uv.Wahl AND mp.Wahlkreis = uv.Wahlkreis
ORDER BY Wahl, Wahlkreis, Prozent DESC;