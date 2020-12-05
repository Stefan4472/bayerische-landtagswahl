-- Anzahl Erststimme für jeden Kandidat (sortiert nach Stimmkreis und Anzahl Stimme)
CREATE OR REPLACE VIEW Kandidat_Stimmkreis_Erststimme AS
SELECT Wahl, Kandidat, Stimmkreis, count(StimmeID) as Anzahl FROM bayerische_landtagswahl.Erststimme
WHERE IsValid = 1
GROUP BY Wahl, Kandidat, Stimmkreis
ORDER BY Wahl, Stimmkreis, Anzahl DESC;

-- TODO: implement 5% check for each candidat
-- Erststimme Gewinner für jeden Stimmkreis mit der Anzahl Stimme
CREATE OR REPLACE VIEW Erststimme_Gewinner_Stimmkreis AS
SELECT kse.Wahl, kse.Kandidat, kse.Stimmkreis, kse.Anzahl FROM Kandidat_Stimmkreis_Erststimme kse
INNER JOIN (SELECT Wahl, Stimmkreis, MAX(Anzahl) as Anzahl FROM Kandidat_Stimmkreis_Erststimme GROUP BY Wahl, Stimmkreis) kse_grouped
ON kse.Wahl = kse_grouped.Wahl AND kse.Anzahl = kse_grouped.Anzahl AND kse.Stimmkreis = kse_grouped.Stimmkreis;

SELECT * FROM Erststimme_Gewinner_Stimmkreis