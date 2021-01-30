-- @Vlad: I kept getting errors that these views already existed. Let me know if this is incorrect
DROP MATERIALIZED VIEW IF EXISTS Erststimme_Kandidat CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Anzhal_Zweitstimme_Kandidat CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_Stimmkreis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_Wahl CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_Wahl CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Erststimme_Gewinner_Pro_Stimmkreis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_und_Sitze_Partei_5Prozent_Wahlkreis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Mitglieder_des_Landtages CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Sitzverteilung CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Mitglieder_des_LandtagesUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS WahlbeteiligungUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_StimmkreisUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS DirektkandidatenUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS StimmkreissiegerUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS UeberhangmandateUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS ErststimmenKandidatStimmkreisUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Knappste_Sieger_Verlierer CASCADE;
DROP MATERIALIZED VIEW IF EXISTS KnappsteSiegerUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS KnappsteVerliererUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Wahlbeteiligung_EinzelstimmenUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Beste_Stimmkreise_ParteiUI CASCADE;

-- Anzahl Erststimme für jeden Kandidat
CREATE MATERIALIZED VIEW Erststimme_Kandidat AS
SELECT Wahl, Wahlkreis, Stimmkreis, Partei, Kandidat, count(StimmeID) as Anzahl
FROM erststimme s
         INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE IsValid = 1
GROUP BY Wahl, Wahlkreis, Kandidat, Partei, Stimmkreis;


-- Anzahl an Zweitstimme für jeden Kandidat in Wahlkreis
CREATE MATERIALIZED VIEW Anzhal_Zweitstimme_Kandidat AS
SELECT Wahl, Wahlkreis, Partei, Kandidat, count(StimmeID) as Anzahl
FROM zweitstimme s
         INNER JOIN Kandidat k ON k.ID = s.Kandidat
WHERE isValid = 1
GROUP BY Wahl, Wahlkreis, Partei, Kandidat
ORDER BY Wahl, Wahlkreis, Partei, Anzahl DESC;


-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_Stimmkreis AS
WITH Erststimmen_Partei_Stimmkreis AS
         (SELECT wahl, wahlkreis, stimmkreis, partei, sum(anzahl) as Anzahl
          FROM Erststimme_Kandidat
          GROUP BY wahl, wahlkreis, stimmkreis, partei),
     Zweitstimmen_Partei_Stimmkreis AS (
         SELECT Wahl, Wahlkreis, Stimmkreis, Partei, sum(anzahl) as Anzahl
         FROM (SELECT Wahl, Wahlkreis, Stimmkreis, Partei, count(StimmeID) as anzahl
               FROM zweitstimme s
                        INNER JOIN Kandidat k ON k.ID = s.Kandidat
               WHERE isValid = 1
               GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei
               UNION ALL
               -- Anzahl an Zweitstimme nur für Partei
               SELECT Wahl, Wahlkreis, Stimmkreis, Partei, count(StimmeID) as Anzahl
               FROM zweitstimmepartei zp
                        INNER JOIN Stimmkreis s ON s.ID = zp.Stimmkreis
               GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei) as skzs
         GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei),
     Gesamtstimmen_Partei_Stimmkreis AS (
         SELECT Wahl, Wahlkreis, Stimmkreis, Partei, sum(Anzahl) as Gesamtstimmen
         FROM (SELECT *
               FROM Erststimmen_Partei_Stimmkreis
               UNION ALL
               SELECT *
               FROM Zweitstimmen_Partei_Stimmkreis) as "EPS*ZPS*"
         GROUP BY Wahl, Wahlkreis, Stimmkreis, Partei),
-- Absolute Anzahl an Stimmen in Stimmkreis
     Gesamtstimmen_Stimmkreis AS (
         SELECT Wahl, Wahlkreis, Stimmkreis, sum(Gesamtstimmen) as Gesamtstimmen
         FROM Gesamtstimmen_Partei_Stimmkreis gps
         GROUP BY Wahl, Wahlkreis, Stimmkreis
     )
SELECT Wahl,
       Wahlkreis,
       Stimmkreis,
       Partei,
       Gesamtstimmen,
       100 * Gesamtstimmen:: decimal / (SELECT gspAll.Gesamtstimmen
                                        FROM Gesamtstimmen_Stimmkreis gspAll
                                        WHERE gspAll.Wahl = gps.Wahl
                                          AND gps.Stimmkreis = gspAll.Stimmkreis) as prozent,
       COALESCE((SELECT eps.Anzahl
        FROM Erststimmen_Partei_Stimmkreis eps
        WHERE eps.Wahl = gps.Wahl
          AND eps.Stimmkreis = gps.stimmkreis
          AND eps.Partei = gps.Partei), 0) as Erststimmen,
       COALESCE((SELECT zps.anzahl
        FROM Zweitstimmen_Partei_Stimmkreis zps
        WHERE zps.Wahl = gps.Wahl
          AND zps.Stimmkreis = gps.stimmkreis
          AND zps.Partei = gps.Partei), 0) as Zweitstimmen
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
with Gesamtstimmen_Wahl as (
    SELECT wahl, sum(Gesamtstimmen) as Gesamtstimmen FROM Gesamtstimmen_Partei_Wahlkreis
    GROUP BY wahl
)
SELECT Wahl,
       Partei,
       sum(Gesamtstimmen) as Gesamtstimmen,
       (sum(Gesamtstimmen) / (SELECT gw.Gesamtstimmen
                              FROM Gesamtstimmen_Wahl gw
                              WHERE gw.Wahl = gps2.Wahl)) * 100 as Prozent
FROM Gesamtstimmen_Partei_Wahlkreis gps2
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


-- Anzahl an Stimmen und Sitze der Partei (über 5 % in Bayern) pro Wahlkreis
CREATE MATERIALIZED VIEW Gesamtstimmen_und_Sitze_Partei_5Prozent_Wahlkreis AS
WITH Gesamtstimmen_Partei_5Prozent AS
-- Parteien die mehr als 5 % der Gesamtstimmen in Bayern haben
		(SELECT t1.Wahl, t1.Wahlkreis, t1.Partei, t1.Gesamtstimmen as Stimmenzahl FROM Gesamtstimmen_Partei_Wahlkreis t1
		-- mindestens 5 % der Gesamtstimmen in Bayern
		INNER JOIN (SELECT * FROM Gesamtstimmen_Partei_Wahl WHERE Prozent >= 5) partei_mit_5proz
		ON partei_mit_5proz.Partei = t1.Partei AND partei_mit_5proz.Wahl = t1.Wahl),
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
				COALESCE(Erststimme_Gewinner_Pro_Partei.Anzahl_Gewinner, 0) as Direktmandate,
				agz.Sitze - COALESCE(Erststimme_Gewinner_Pro_Partei.Anzahl_Gewinner, 0) as Listmandate
		FROM Gesamtstimmen_und_Sitze_Partei agz
		LEFT JOIN (SELECT Wahl, Wahlkreis, Partei, count(Kandidat) as Anzahl_Gewinner FROM Erststimme_Gewinner_Pro_Stimmkreis
					GROUP BY Wahl, Wahlkreis, Partei) Erststimme_Gewinner_Pro_Partei
		ON Erststimme_Gewinner_Pro_Partei.Wahl = agz.Wahl
			AND Erststimme_Gewinner_Pro_Partei.Wahlkreis = agz.Wahlkreis
			AND Erststimme_Gewinner_Pro_Partei.Partei = agz.Partei),
-- Berechnen Überhangmandaten Ratio für alle Wahlkreise.
	Ueberhangsmandate_Verhaeltnis AS
		(SELECT Wahl, Wahlkreis, MAX(Direktmandate / Sitze) as Ueberhangsmandate_Verhaeltnis FROM Mandate_Partei mp
		GROUP BY Wahl, Wahlkreis
		HAVING MAX(Direktmandate / Sitze) > 1)
-- Berechnen Sitze für alle Parteien wenn es zu Überhangmandaten kommt.
SELECT distinct mp.Wahl, mp.Wahlkreis, mp.Partei, mp.Stimmenzahl, mp.Prozent, mp.Sitze,
		ROUND(mp.Sitze * COALESCE(uv.Ueberhangsmandate_Verhaeltnis, 1)) as Ueberhangsmandate_Sitze,
        ROUND(mp.Sitze * COALESCE(uv.Ueberhangsmandate_Verhaeltnis, 1))  - mp.Sitze as Ueberhangsmandate,
        mp.Direktmandate,
		ROUND(mp.Sitze * COALESCE(uv.Ueberhangsmandate_Verhaeltnis, 1)) - mp.Direktmandate as Listmandate
FROM Mandate_Partei mp
LEFT JOIN Ueberhangsmandate_Verhaeltnis uv
ON mp.Wahl = uv.Wahl AND mp.Wahlkreis = uv.Wahlkreis
ORDER BY Wahl, Wahlkreis, Prozent DESC;


-- Alle Gewählte.
CREATE MATERIALIZED VIEW Mitglieder_des_Landtages AS
-- Alle gewählte Listkandidaten.
WITH Listkandidaten AS (
    SELECT *
    FROM (SELECT *,
                 RANK() OVER (PARTITION BY Wahl, Wahlkreis, Partei ORDER BY Wahl, Wahlkreis, Partei, Anzahl DESC) AS Nr
          FROM Anzhal_Zweitstimme_Kandidat azk
          WHERE azk.Kandidat NOT IN (SELECT Kandidat FROM Erststimme_Gewinner_Pro_Stimmkreis)) AS azk
    WHERE Nr <= (SELECT Listmandate
                 FROM Gesamtstimmen_und_Sitze_Partei_5Prozent_Wahlkreis gsp
                 WHERE gsp.Wahl = azk.Wahl
                   AND gsp.Wahlkreis = azk.Wahlkreis
                   AND gsp.Partei = azk.Partei)
)
SELECT eg.Kandidat, eg.Partei, eg.Wahlkreis, eg.Stimmkreis, eg.Wahl, true as Direktkandidat
FROM Erststimme_Gewinner_Pro_Stimmkreis eg
UNION
SELECT lk.Kandidat, lk.Partei, lk.Wahlkreis, null, lk.Wahl, false as Direktkandidat
FROM Listkandidaten lk;


-- Q6 Knappste Sieger
CREATE MATERIALIZED VIEW Knappste_Sieger_Verlierer AS
WITH erststimmen_stimmkreis AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY wahl, wahlkreis, stimmkreis
               ORDER BY es2.anzahl DESC)                  as rk,
           es2.Anzahl - (SELECT MAX(anzahl)
                         FROM erststimme_kandidat es
                         WHERE es.Wahl = es2.Wahl
                           AND es.Stimmkreis = es2.Stimmkreis
                         GROUP BY es.Wahl, es.Stimmkreis) as rueckstand
    FROM erststimme_kandidat es2
    ORDER BY wahl, wahlkreis, stimmkreis, anzahl DESC),
     gewinner_vorsprung as (SELECT wahl,
                                   wahlkreis,
                                   stimmkreis,
                                   partei,
                                   kandidat,
                                   anzahl,
                                   erst.anzahl - (SELECT e.anzahl
                                                  FROM erststimmen_stimmkreis e
                                                  WHERE e.rk = 2
                                                    AND e.wahl = erst.wahl
                                                    AND e.stimmkreis = erst.stimmkreis) as vorsprung
                            FROM erststimmen_stimmkreis erst
                            WHERE erst.rk = 1),
     sieger_partei AS (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY wahl, partei
                    ORDER BY vorsprung) as rk
         FROM gewinner_vorsprung gv
         ORDER BY wahl, partei, rk),
     zehn_knappsten_sieger_partei as (
         SELECT *
         FROM sieger_partei
         WHERE rk <= 10),
     partein_ohne_gewinner AS (
         SELECT wahlid, partei
         FROM parteizuwahl pzw
         WHERE partei not in (
             SELECT distinct partei
             FROM sieger_partei sp
             WHERE pzw.wahlid = sp.wahl)),
     am_knappsten_verloren AS (
         SELECT es.Wahl,
                Wahlkreis,
                Stimmkreis,
                es.Partei,
                Kandidat,
                Anzahl as Erststimmen,
                es.rueckstand,
                ROW_NUMBER() OVER (PARTITION BY es.wahl, es.partei
                    ORDER BY rueckstand DESC) as rk
         FROM erststimmen_stimmkreis es
                  INNER JOIN partein_ohne_gewinner pog ON es.Wahl = pog.wahlid AND pog.partei = es.Partei)
SELECT *
FROM am_knappsten_verloren akv
WHERE rk <= 10
UNION ALL
SELECT *
FROM zehn_knappsten_sieger_partei
ORDER BY Wahl, partei, rueckstand DESC;


-- Q1 Sitzverteilung
CREATE MATERIALIZED VIEW Sitzverteilung AS
SELECT w.id as WahlID, w.jahr, p.parteiname, count(Kandidat) as Anzahl_der_Sitze FROM Mitglieder_des_Landtages mds
INNER JOIN Wahl w ON w.ID = mds.wahl
INNER JOIN Partei p ON p.ID = mds.partei
GROUP BY w.id, w.jahr, p.parteiname;


-- Q2 Mitglieder des Landtages
CREATE MATERIALIZED VIEW Mitglieder_des_LandtagesUI AS
SELECT k.vorname,
       k.nachname,
       mdl.Direktkandidat,
       p.parteiname as Partei,
       w.id         as WahlID,
       w.jahr,
       wk.name      as Wahlkreis,
       s.id         as StimmkreisID,
       s.name       as Stimmkreis
FROM Mitglieder_des_Landtages mdl
         LEFT JOIN stimmkreis s ON mdl.stimmkreis = s.id
         INNER JOIN wahlkreis wk ON wk.id = mdl.wahlkreis
         INNER JOIN wahl w ON mdl.wahl = w.id
         INNER JOIN partei p ON p.id = mdl.Partei
         INNER JOIN kandidat k ON k.id = mdl.kandidat;


-- Q3 Stimmkreisuebersicht

-- Wahlbeteiligung
CREATE MATERIALIZED VIEW WahlbeteiligungUI AS
SELECT w.id                                               as WahlID,
       w.jahr,
       wk.name                                            as Wahlkreis,
       s.id                                               as StimmkreisID,
       s.name                                             as Stimmkreis,
       100 * count(StimmeID)::decimal / s.numberechtigter as Wahlbeteiligung
FROM erststimme es
         INNER JOIN stimmkreis s ON es.stimmkreis = s.id
         INNER JOIN wahlkreis wk ON wk.id = s.wahlkreis
         INNER JOIN wahl w on es.wahl = w.id
GROUP BY w.id, w.jahr, wk.name, s.id, s.name
ORDER BY s.id;

-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_StimmkreisUI AS
SELECT w.id as WahlID,
       w.jahr,
       wk.name as Wahlkreis,
       s.id    as StimmkreisID,
       s.name  as Stimmkreis,
       s.nummer as StimmkreisNr,
       p.parteiname,
       gps.gesamtstimmen,
       gps.prozent,
       gps.Erststimmen,
       gps.Zweitstimmen
FROM Gesamtstimmen_Partei_Stimmkreis gps
         INNER JOIN stimmkreis s ON gps.stimmkreis = s.id
         INNER JOIN wahlkreis wk ON wk.id = gps.wahlkreis
         INNER JOIN wahl w ON gps.wahl = w.id
         INNER JOIN partei p ON p.id = gps.Partei;

-- Direktkandidaten
CREATE MATERIALIZED VIEW DirektkandidatenUI AS
SELECT w.id as WahlID,
       w.jahr,
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
SELECT s.WahlID,
       s.jahr,
       s.wahlkreis,
       s.stimmkreisid,
       s.stimmkreis,
       s.StimmkreisNr,
       s.parteiname,
       s.gesamtstimmen,
       s.prozent,
       s.Erststimmen,
       s.Zweitstimmen
FROM summary s
WHERE s.rk = 1;

-- Q5 Ueberhangmandate
CREATE MATERIALIZED VIEW UeberhangmandateUI AS
SELECT w.id as WahlID, w.jahr, wk.id as wahlkreisID, wk.name as wahlkreis, p.parteiname, Ueberhangsmandate
FROM Gesamtstimmen_und_Sitze_Partei_5Prozent_Wahlkreis gsp
         INNER JOIN wahl w ON w.id = gsp.wahl
         INNER JOIN wahlkreis wk ON wk.id = gsp.wahlkreis
         INNER JOIN partei p ON p.id = gsp.partei;


-- Q6 Knappste Sieger
CREATE MATERIALIZED VIEW KnappsteSiegerUI AS
SELECT w.id as WahlID,
       w.jahr,
       p.parteiname,
       rk             as Nr,
       wk.name        as Wahlkreis,
       s.id           as StimmkreisID,
       s.name         as Stimmkreis,
       s.nummer       as StimmkreisNr,
       k.vorname,
       k.nachname,
       ksv.erststimmen,
       ksv.rueckstand as Vorsprung
FROM Knappste_Sieger_Verlierer ksv
         INNER JOIN wahl w ON w.id = ksv.wahl
         INNER JOIN wahlkreis wk ON wk.id = ksv.wahlkreis
         INNER JOIN partei p ON p.id = ksv.partei
         INNER JOIN stimmkreis s ON s.id = ksv.stimmkreis
         INNER JOIN kandidat k ON k.id = ksv.kandidat
WHERE rueckstand > 0
ORDER BY ksv.wahl DESC, ksv.partei, rk;

-- Knappste Verlierer
CREATE MATERIALIZED VIEW KnappsteVerliererUI AS
SELECT w.jahr,
       p.parteiname,
       rk      as Nr,
       wk.name as Wahlkreis,
       s.id    as StimmkreisID,
       s.name  as Stimmkreis,
       k.vorname,
       k.nachname,
       ksv.erststimmen,
       ksv.rueckstand
FROM Knappste_Sieger_Verlierer ksv
         INNER JOIN wahl w ON w.id = ksv.wahl
         INNER JOIN wahlkreis wk ON wk.id = ksv.wahlkreis
         INNER JOIN partei p ON p.id = ksv.partei
         INNER JOIN stimmkreis s ON s.id = ksv.stimmkreis
         INNER JOIN kandidat k ON k.id = ksv.kandidat
WHERE rueckstand < 0
ORDER BY ksv.wahl DESC, ksv.partei, rk;


-- Erststimmen pro Kandidat, pro Stimmkreis
CREATE MATERIALIZED VIEW ErststimmenKandidatStimmkreisUI AS
SELECT ek.Wahl as WahlID, ek.stimmkreis, k.vorname, k.nachname, ek.anzahl, p.ParteiName
FROM Erststimme_Kandidat ek
    INNER JOIN Kandidat k ON k.ID = ek.kandidat
    INNER JOIN Partei p ON p.ID = ek.partei;


-- Q7 Stimmkreisübersicht (Einzelstimmen)
CREATE MATERIALIZED VIEW Wahlbeteiligung_EinzelstimmenUI AS
WITH Anzhal_Stimmen_Stimmkreis AS (
    SELECT e.wahl, e.stimmkreis, count(e.stimmeID) as anzahlstimmen
    FROM erststimme e
    GROUP BY e.wahl, e.stimmkreis
)
SELECT w.jahr,
       wk.name                                             as Wahlkreis,
       s.id                                                as StimmkreisID,
       s.name                                              as Stimmkreis,
       100 * es.anzahlstimmen::decimal / s.numberechtigter as wahlbeteiligung
FROM stimmkreis s
         INNER JOIN Anzhal_Stimmen_Stimmkreis as es ON es.stimmkreis = s.id
         INNER JOIN wahl w on w.id = es.wahl
         INNER JOIN wahlkreis wk on wk.id = s.wahlkreis;


-- Wahlzettel
CREATE OR REPLACE FUNCTION erststimmeWahlzettel(jahrParam integer, stimmkreisParam integer)
    returns TABLE
            (
                jahr       integer,
                wahlkreis  varchar(255),
                stimmkreis  varchar(255),
                KandidatID integer,
                vorname    varchar(255),
                nachname   varchar(255),
                parteiname varchar(255)
            )
as
$func$
BEGIN
    RETURN QUERY
        SELECT w.jahr, wk.name,s.name as Stimmkreis, k.id as KandidatID, k.vorname, k.nachname, p.parteiname
        FROM dkandidatzustimmkreis ks
                 INNER JOIN Kandidat k ON k.ID = ks.kandidat
                 INNER JOIN wahl w ON w.id = k.wahlid
                 INNER JOIN stimmkreis s ON s.id = ks.stimmkreis
                 INNER JOIN wahlkreis wk ON wk.id = s.wahlkreis
                 INNER JOIN Partei p ON p.ID = k.partei
        WHERE w.jahr = jahrParam AND s.id = stimmkreisParam
        ORDER BY w.id DESC, s.id;
END
$func$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION zweitstimmeWahlzettel(jahrParam integer, stimmkreisParam integer)
    returns TABLE
            (
                jahr       integer,
                name       varchar(255),
                KandidatID integer,
                vorname    varchar(255),
                nachname   varchar(255),
                parteiname varchar(255)
            )
as
$func$
BEGIN
    RETURN QUERY
        SELECT w.jahr, wk.name as Wahlkreis, k.id as KandidatID, k.vorname, k.nachname, p.parteiname
        FROM dkandidatzustimmkreis ks
                 INNER JOIN Kandidat k ON k.ID = ks.kandidat
                 INNER JOIN wahl w ON w.id = k.wahlid
                 INNER JOIN stimmkreis s ON s.id = ks.stimmkreis
                 INNER JOIN wahlkreis wk ON wk.id = s.wahlkreis
                 INNER JOIN Partei p ON p.ID = k.partei
        WHERE w.jahr = jahrParam
          AND wk.id = (SELECT st.wahlkreis FROM stimmkreis st where st.id = stimmkreisParam AND st.wahlid = w.id)
          AND k.id not in (SELECT erst.KandidatID FROM erststimmewahlzettel(jahrParam, stimmkreisParam) erst)
        ORDER BY p.id;

END
$func$ LANGUAGE plpgsql;


--Aufgabe2 Ausgedachte Analysen

-- 10 beste Stimmkreise für alle Parteien, wo sie größte prozentuale Anzahl an Stimmen haben.
CREATE MATERIALIZED VIEW Beste_Stimmkreise_ParteiUI AS
WITH Gesamtstimmen_Partei_Rank AS (
    SELECT rank() OVER (PARTITION BY gps.Wahl, gps.Partei ORDER BY gps.prozent DESC) as nr, gps.*
    FROM Gesamtstimmen_Partei_Stimmkreis gps
    ORDER BY gps.Wahl DESC)
SELECT nr,
       w.jahr,
       p.parteiname,
       s.id   as stimmkreisID,
       s.name as stimmkreis,
       gps.Erststimmen,
       gps.Zweitstimmen,
       gps.Gesamtstimmen,
       gps.prozent
FROM Gesamtstimmen_Partei_Rank gps
         INNER JOIN wahl w ON w.id = gps.wahl
         INNER JOIN stimmkreis s ON s.id = gps.stimmkreis
         INNER JOIN Partei p ON p.ID = gps.partei
WHERE nr <= 10;
