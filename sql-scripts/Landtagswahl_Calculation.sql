-- Anzahl Erststimme für jeden Kandidat
CREATE MATERIALIZED VIEW Erststimme_Kandidat AS
SELECT Wahl, Wahlkreis, Stimmkreis, Partei, Kandidat, count(StimmeID) as Anzahl
FROM erststimme s
         INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE IsValid = 1
GROUP BY Wahl, Wahlkreis, Kandidat, Partei, Stimmkreis;

-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_Stimmkreis AS
WITH Gesamtstimmen_Partei_Stimmkreis AS (
    SELECT Wahl, Wahlkreis, Stimmkreis, Partei, sum(Anzahl) as Gesamtstimmen
    FROM (SELECT wahl, wahlkreis, stimmkreis, partei, sum(anzahl) as Anzahl
          FROM Erststimme_Kandidat
          GROUP BY wahl, wahlkreis, stimmkreis, partei
          UNION ALL
-- Anzahl an Zweitstimme für jeden Kandidat in Wahlkreis
          SELECT Wahl, Wahlkreis, Stimmkreis, Partei, count(StimmeID) as Anzahl
          FROM zweitstimme s
                   INNER JOIN Kandidat k ON k.ID = s.Kandidat
          WHERE isValid = 1
          GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei
          UNION ALL
-- Anzahl an Zweitstimme nur für Partei
          SELECT Wahl, Wahlkreis, Stimmkreis, Partei, count(StimmeID) as Anzahl
          FROM zweitstimmepartei zp
                   INNER JOIN Stimmkreis s ON s.ID = zp.Stimmkreis
          GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei) as EKsk
    GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei),
-- Absolute Anzahl an Stimmen in Stimmkreis
     Gesamtstimmen_Stimmkreis AS (
         SELECT Wahl, Wahlkreis, Stimmkreis, sum(Gesamtstimmen) as Gesamtstimmen
         FROM Gesamtstimmen_Partei_Stimmkreis gps
         GROUP BY Wahl, Wahlkreis, Stimmkreis
     )
--
SELECT Wahl,
       Wahlkreis,
       Stimmkreis,
       Partei,
       Gesamtstimmen,
       100 * Gesamtstimmen:: decimal / (SELECT gspAll.Gesamtstimmen
                                        FROM Gesamtstimmen_Stimmkreis gspAll
                                        WHERE gspAll.Wahl = gps.Wahl
                                          AND gps.Stimmkreis = gspAll.Stimmkreis) as prozent
FROM Gesamtstimmen_Partei_Stimmkreis gps
ORDER BY Wahl, Stimmkreis, Gesamtstimmen DESC;


-- Gesamtstimmen aller Parteien pro Wahlkreis
CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_Wahlkreis AS
SELECT Wahl,
       Wahlkreis,
       Partei,
       sum(Gesamtstimmen) as Gesamtstimmen
FROM Gesamtstimmen_Partei_Stimmkreis gps
GROUP BY Wahl, Wahlkreis, Partei;


-- Die Zahl der Gesamtstimmen der Partei mit Prozent in Bayern
CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_Wahl AS
SELECT Wahl,
       Partei,
       sum(Gesamtstimmen)                                                                           as Gesamtstimmen,
       (sum(Gesamtstimmen) / (SELECT sum(Gesamtstimmen) FROM Gesamtstimmen_Partei_Wahlkreis)) * 100 as Prozent
FROM Gesamtstimmen_Partei_Wahlkreis
GROUP BY Wahl, Partei;


-- Erststimme Gewinner für jeden Stimmkreis (Kandidat mit meisten Anzahl an Erststimmen, dessen Partei mindestens 5 % der Gesamtstimmen in Bayern erreicht hat)
CREATE MATERIALIZED VIEW Erststimme_Gewinner_Pro_Stimmkreis AS
SELECT kse.Wahl, kse.Wahlkreis, kse.Stimmkreis, kse.Kandidat, kse.Partei, kse.Anzahl as Erststimme
FROM Erststimme_Kandidat kse
         INNER JOIN (SELECT k.Wahl, k.Stimmkreis, MAX(Anzahl) as Anzahl
                     FROM Erststimme_Kandidat k
                              INNER JOIN Gesamtstimmen_Partei_Wahl gpw ON gpw.Partei = k.Partei
                          -- mindestens 5 % der Gesamtstimmen in Bayern
                     WHERE gpw.Prozent >= 5
                     GROUP BY k.Wahl, k.Stimmkreis) kse_grouped
                    ON kse.Wahl = kse_grouped.Wahl AND kse.Anzahl = kse_grouped.Anzahl AND
                       kse.Stimmkreis = kse_grouped.Stimmkreis
ORDER BY kse.Wahl, kse.Stimmkreis;



-- Q3 Stimmkreisuebersicht

-- Wahlbeteiligung
CREATE MATERIALIZED VIEW WahlbeteiligungUI AS
SELECT w.jahr,
       wk.name                                            as Wahlkreis,
       s.id                                               as StimmkreisID,
       s.name                                             as Stimmkreis,
       100 * count(StimmeID)::decimal / s.numberechtigter as Wahlbeteiligung
FROM erststimme es
         INNER JOIN stimmkreis s ON es.stimmkreis = s.id
         INNER JOIN wahlkreis wk ON wk.id = s.wahlkreis
         INNER JOIN wahl w on es.wahl = w.id
GROUP BY w.jahr, wk.name, s.id, s.name
ORDER BY s.id;

-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_StimmkreisUI AS
SELECT w.jahr,
       wk.name as Wahlkreis,
       s.id    as StimmkreisID,
       s.name  as Stimmkreis,
       p.parteiname,
       gps.gesamtstimmen,
       gps.prozent
FROM Gesamtstimmen_Partei_Stimmkreis gps
         INNER JOIN stimmkreis s ON gps.stimmkreis = s.id
         INNER JOIN wahlkreis wk ON wk.id = gps.wahlkreis
         INNER JOIN wahl w ON gps.wahl = w.id
         INNER JOIN partei p ON p.id = gps.Partei;


-- Direktkandidaten
CREATE MATERIALIZED VIEW DirektkandidatenUI AS
SELECT w.jahr,
       wk.name as Wahlkreis,
       s.id    as StimmkreisID,
       s.name  as Stimmkreis,
       k.vorname,
       k.nachname,
       p.parteiname,
       eg.erststimme
FROM Erststimme_Gewinner_Pro_Stimmkreis eg
         INNER JOIN wahl w ON w.id = eg.wahl
         INNER JOIN wahlkreis wk ON wk.id = eg.wahlkreis
         INNER JOIN stimmkreis s ON s.id = eg.stimmkreis
         INNER JOIN kandidat k ON k.id = eg.kandidat
         INNER JOIN partei p ON p.id = eg.partei
ORDER BY w.jahr, s.id;

-- Q4 Stimmkreissieger
CREATE MATERIALIZED VIEW StimmkreissiegerUI AS
WITH summary AS (
    SELECT gps.*,
           ROW_NUMBER() OVER (PARTITION BY gps.jahr, gps.stimmkreisID
               ORDER BY gps.gesamtstimmen DESC) AS rk
    FROM Gesamtstimmen_Partei_StimmkreisUI gps)
SELECT s.jahr, s.wahlkreis, s.stimmkreisid, s.stimmkreis, s.parteiname, s.gesamtstimmen, s.prozent
FROM summary s
WHERE s.rk = 1