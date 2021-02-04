DROP FUNCTION IF EXISTS Erststimme_Kandidat CASCADE;
DROP FUNCTION IF EXISTS Gesamtstimmen_Partei_Stimmkreis CASCADE;
DROP FUNCTION IF EXISTS Sitze_Partei_Wahlkreis CASCADE;
DROP FUNCTION IF EXISTS erststimmeWahlzettel CASCADE;
DROP FUNCTION IF EXISTS zweitstimmeWahlzettel CASCADE;
DROP FUNCTION IF EXISTS create_sitze_wahlkreise_table CASCADE;
DROP FUNCTION IF EXISTS calculate_mandate CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Erststimme_Kandidat CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_Stimmkreis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_Wahlkreis CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_Wahl CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Erststimme_Gewinner_Pro_Stimmkreis CASCADE;
DROP TABLE IF EXISTS Sitze_Wahlkreise CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Sitze_Partei_Vor_Ausgleich CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_und_Sitze_Partei CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Mitglieder_des_Landtages CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Knappste_Sieger_Verlierer CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Sitzverteilung CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Mitglieder_des_LandtagesUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS WahlbeteiligungUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Gesamtstimmen_Partei_StimmkreisUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS DirektkandidatenUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Entwicklung_Stimmen_2018_zum_2013UI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS StimmkreissiegerUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS UeberhangmandateUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS KnappsteSiegerUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS KnappsteVerliererUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS ErststimmenKandidatStimmkreisUI CASCADE;
DROP VIEW IF EXISTS Wahlbeteiligung_EinzelstimmenUI CASCADE;
DROP VIEW IF EXISTS Gesamtstimmen_Partei_Stimmkreis_EinzelstimmenUI CASCADE;
DROP VIEW IF EXISTS Direktkandidaten_EinzelstimmenUI CASCADE;
DROP VIEW IF EXISTS Entwicklung_Stimmen_2018_zum_2013_EinzelstimmenUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Beste_Stimmkreise_ParteiUI CASCADE;
DROP MATERIALIZED VIEW IF EXISTS Partei_Einordnung_AnalyseUI CASCADE;

-- Anzahl Erststimme für jeden Kandidat
CREATE OR REPLACE FUNCTION Erststimme_Kandidat()
    returns TABLE
            (
                wahlID       integer,
                wahlkreisID  integer,
                stimmkreisID integer,
                kandidatID   integer,
                parteiID     integer,
                anzahl       numeric
            )
as
$func$
BEGIN
    RETURN QUERY
        WITH erststimme_kand AS
                 (SELECT Wahl, Stimmkreis, Kandidat, count(StimmeID)::numeric as Anzahl
                  FROM erststimme s
                  WHERE IsValid = 1
                  GROUP BY Wahl, Kandidat, Stimmkreis)
        SELECT es.wahl, k.wahlkreis, es.stimmkreis, es.kandidat, k.partei, es.Anzahl
        FROM erststimme_kand as es
                 INNER JOIN Kandidat k ON k.ID = es.Kandidat;
END
$func$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW Erststimme_Kandidat AS
SELECT wahlID       as Wahl,
       wahlkreisID  as wahlkreis,
       stimmkreisID as stimmkreis,
       parteiID     as partei,
       kandidatID   as kandidat,
       anzahl
FROM Erststimme_Kandidat();


-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
CREATE OR REPLACE FUNCTION Gesamtstimmen_Partei_Stimmkreis()
    returns TABLE
            (
                wahlID       integer,
                stimmkreisID integer,
                parteiID     integer,
                gesamt       numeric,
                proz         decimal,
                erst         numeric,
                zweit        numeric
            )
as
$func$
BEGIN
    RETURN QUERY
        WITH Kandidat_Erststimme AS
                 (SELECT s.Wahl, s.Stimmkreis, s.Kandidat, count(s.StimmeID) as Anzahlstimmen
                  FROM erststimme s
                  WHERE s.IsValid = 1
                  GROUP BY s.Wahl, s.Stimmkreis, s.Kandidat),
             Partei_Erststimme AS
                 (SELECT ke.wahl, ke.stimmkreis, k.partei, sum(Anzahlstimmen) as Anzahlstimmen
                  FROM Kandidat_Erststimme ke
                           INNER JOIN kandidat k ON k.id = ke.kandidat
                  GROUP BY ke.Wahl, ke.Stimmkreis, k.partei),
             Kandidat_Zweitstimme AS
                 (SELECT z.*, k.partei
                  FROM (SELECT Wahl, Stimmkreis, Kandidat, count(StimmeID) as Anzahlstimmen
                        FROM zweitstimme s
                        WHERE isValid = 1
                        GROUP BY Wahl, Stimmkreis, kandidat) z
                           INNER JOIN kandidat k ON k.id = z.kandidat),
             Kandidat_Partei_Zweitstimme AS
                 (SELECT wahl, stimmkreis, partei, sum(Anzahlstimmen) as Anzahlstimmen
                  FROM Kandidat_Zweitstimme kz
                  GROUP BY wahl, stimmkreis, partei),
             Partei_Zweitstimme AS
                 (SELECT Wahl, Stimmkreis, Partei, count(stimmeid) as Anzahlstimmen
                  FROM zweitstimmepartei
                  GROUP BY Wahl, Stimmkreis, Partei),
             Gesamtstimmen_Partei_Stimmkreis AS (
                 SELECT data.wahl, data.stimmkreis, data.partei, sum(data.Anzahlstimmen) as Gesamtstimmen
                 FROM (SELECT *
                       FROM Partei_Erststimme
                       UNION ALL
                       SELECT *
                       FROM Kandidat_Partei_Zweitstimme
                       UNION ALL
                       SELECT *
                       FROM Partei_Zweitstimme) as data
                 GROUP BY data.wahl, data.stimmkreis, data.partei),
             Gesamtstimmen_Stimmkreis AS (
                 SELECT gps.Wahl, gps.Stimmkreis, sum(Gesamtstimmen) as Gesamtstimmen
                 FROM Gesamtstimmen_Partei_Stimmkreis gps
                 GROUP BY gps.Wahl, gps.Stimmkreis
             )
        SELECT gps.Wahl,
               gps.Stimmkreis,
               gps.Partei,
               gps.Gesamtstimmen,
               100 * Gesamtstimmen:: decimal / (SELECT gspAll.Gesamtstimmen
                                                FROM Gesamtstimmen_Stimmkreis gspAll
                                                WHERE gspAll.Wahl = gps.Wahl
                                                  AND gps.Stimmkreis = gspAll.Stimmkreis) as prozent,
               COALESCE((SELECT eps.Anzahlstimmen
                         FROM Partei_Erststimme eps
                         WHERE eps.Wahl = gps.Wahl
                           AND eps.Stimmkreis = gps.stimmkreis
                           AND eps.Partei = gps.Partei), 0)                               as Erststimmen,
               Gesamtstimmen - COALESCE((SELECT eps.Anzahlstimmen
                                         FROM Partei_Erststimme eps
                                         WHERE eps.Wahl = gps.Wahl
                                           AND eps.Stimmkreis = gps.stimmkreis
                                           AND eps.Partei = gps.Partei), 0)               as Zweitstimmen
        FROM Gesamtstimmen_Partei_Stimmkreis gps
        ORDER BY gps.Wahl, gps.Stimmkreis, Gesamtstimmen DESC;
END
$func$ LANGUAGE plpgsql;

CREATE MATERIALIZED VIEW Gesamtstimmen_Partei_Stimmkreis AS
SELECT g.wahlID       as Wahl,
       s.wahlkreis    as Wahlkreis,
       g.stimmkreisID as stimmkreis,
       g.parteiID     as partei,
       gesamt         as Gesamtstimmen,
       proz           as Prozent,
       erst           as Erststimmen,
       zweit          as Zweitstimmen
FROM Gesamtstimmen_Partei_Stimmkreis() g
         INNER JOIN stimmkreis s ON s.id = g.stimmkreisID;


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
with Gesamtstimmen_Wahl as
         (SELECT wahl, sum(Gesamtstimmen) as Gesamtstimmen
          FROM Gesamtstimmen_Partei_Wahlkreis
          GROUP BY wahl)
SELECT Wahl,
       Partei,
       sum(Gesamtstimmen)                                       as Gesamtstimmen,
       (sum(Gesamtstimmen) / (SELECT gw.Gesamtstimmen
                              FROM Gesamtstimmen_Wahl gw
                              WHERE gw.Wahl = gps2.Wahl)) * 100 as Prozent
FROM Gesamtstimmen_Partei_Wahlkreis gps2
GROUP BY Wahl, Partei;


-- Erststimme Gewinner für jeden Stimmkreis (Kandidat mit meisten Anzahl an Erststimmen, dessen Partei mindestens 5 % der Gesamtstimmen in Bayern erreicht hat)
CREATE MATERIALIZED VIEW Erststimme_Gewinner_Pro_Stimmkreis AS
WITH Kandidat_Mit_Partei_Ueber_5Proz AS
         (SELECT kse.*, rank() over (PARTITION BY Wahl, stimmkreis ORDER BY anzahl DESC)
          FROM Erststimme_Kandidat kse
          WHERE (SELECT gwp.Prozent
                 FROM Gesamtstimmen_Partei_Wahl gwp
                 WHERE gwp.wahl = kse.wahl
                   AND gwp.partei = kse.partei) >= 5)
SELECT Wahl, wahlkreis, stimmkreis, kandidat, partei, anzahl as Erststimme
FROM Kandidat_Mit_Partei_Ueber_5Proz k
WHERE k.rank = 1;


CREATE OR REPLACE FUNCTION create_sitze_wahlkreise_table()
    RETURNS VOID AS
$func$
BEGIN
    DROP TABLE IF EXISTS sitze_wahlkreise;

    CREATE TABLE sitze_wahlkreise AS
    SELECT w.id as wahl, wk.id as wahlkreis, wk.mandate
    FROM wahlkreis wk,
         wahl w;
END
$func$ LANGUAGE plpgsql;

do
$$
    begin
        perform create_sitze_wahlkreise_table();
    end
$$;

-- sitze pro partei in wahlkreis
CREATE OR REPLACE FUNCTION Sitze_Partei_Wahlkreis()
    returns TABLE
            (
                wahlID       integer,
                wahlkreisID  integer,
                parteiID     integer,
                stim         numeric,
                proz         decimal,
                anz_sitze    numeric,
                direct_sitze numeric
            )
as
$func$
BEGIN
    RETURN QUERY
        WITH Gesamtstimmen_Partei_5Prozent AS
-- Parteien die mehr als 5 % der Gesamtstimmen in Bayern haben
                 (SELECT Wahl, Wahlkreis, Partei, Gesamtstimmen as Stimmenzahl
                  FROM Gesamtstimmen_Partei_Wahlkreis gpw
                  WHERE gpw.partei IN
                        (SELECT gpw2.partei
                         FROM Gesamtstimmen_Partei_Wahl gpw2
                         WHERE gpw.wahl = gpw2.wahl
                           AND gpw2.prozent >= 5)),
-- Absolute Stimmenzahl einer Partei wird durch die Gesamtzahl der Stimmen aller Parteien dividiert
             Prozent_Gesamtstimmen_Partei_Wahlkreis as
                 (SELECT gpp.*,
                         100 * Stimmenzahl / (SELECT sum(Stimmenzahl)
                                              FROM Gesamtstimmen_Partei_5Prozent gpp2
                                              WHERE gpp.Wahlkreis = gpp2.Wahlkreis
                                                AND gpp.Wahl = gpp2.Wahl
                                              GROUP BY Wahl, Wahlkreis) as Prozent
                  FROM Gesamtstimmen_Partei_5Prozent gpp),
             Ganzzahligen_anteil_sitze_partei AS
                 (SELECT pgpw.*,
                         floor(pgpw.Prozent::decimal / 100 *
                               (SELECT w.mandate
                                FROM sitze_wahlkreise w
                                WHERE pgpw.Wahlkreis = w.wahlkreis
                                  AND pgpw.Wahl = w.wahl))                          as Sitze,
                         rank() over (PARTITION BY wahl, wahlkreis ORDER BY (pgpw.Prozent::decimal / 100 *
                                                                             (SELECT w.mandate
                                                                              FROM sitze_wahlkreise w
                                                                              WHERE pgpw.Wahlkreis = w.wahlkreis
                                                                                AND pgpw.Wahl = w.wahl)) %
                                                                            1 DESC) as Nachkommazahlen_rank
                  FROM Prozent_Gesamtstimmen_Partei_Wahlkreis pgpw),
             rest_sitze_wahlkreis as
                 (SELECT wahl,
                         wahlkreis,
                         (SELECT w.mandate
                          FROM sitze_wahlkreise w
                          WHERE gasp.Wahlkreis = w.wahlkreis
                            AND gasp.Wahl = w.wahl) -
                         sum(Sitze) as rest_sitze
                  FROM Ganzzahligen_anteil_sitze_partei gasp
                  GROUP BY wahl, wahlkreis),
             Partei_mitrest_sitze AS
                 (SELECT gasp.wahl, gasp.wahlkreis, gasp.partei
                  FROM Ganzzahligen_anteil_sitze_partei gasp
                  WHERE gasp.Nachkommazahlen_rank <=
                        (SELECT rsw.rest_sitze
                         FROM rest_sitze_wahlkreis rsw
                         WHERE gasp.wahl = rsw.wahl
                           AND gasp.wahlkreis = rsw.wahlkreis)),
             Anzahl_Gewinner_Partei AS
                 (SELECT Wahl, Wahlkreis, Partei, count(Kandidat) as Anzahl_Gewinner
                  FROM Erststimme_Gewinner_Pro_Stimmkreis
                  GROUP BY Wahl, Wahlkreis, Partei),
             Partei_Sitze AS
                 (SELECT gasp.wahl,
                         gasp.wahlkreis,
                         gasp.partei,
                         gasp.Stimmenzahl,
                         gasp.Prozent,
                         gasp.Sitze + (case
                                           when partei in (SELECT pms.partei
                                                           FROM Partei_mitrest_sitze pms
                                                           WHERE pms.wahl = gasp.wahl
                                                             AND pms.wahlkreis = gasp.wahlkreis)
                                               then 1
                                           else 0 end) as anzahlsitze
                  FROM Ganzzahligen_anteil_sitze_partei gasp)
        SELECT ps.*, COALESCE(agp.Anzahl_Gewinner, 0)::numeric as Direktmandate
        FROM Partei_Sitze ps
                 LEFT JOIN Anzahl_Gewinner_Partei agp
                           ON agp.Wahl = ps.Wahl
                               AND agp.Wahlkreis = ps.Wahlkreis
                               AND agp.Partei = ps.Partei;
END
$func$ LANGUAGE plpgsql;


-- Anzahl an Stimmen und Sitze der Partei vor der Berechnung der Überhang- und ggf. Ausgleichsmandaten
CREATE MATERIALIZED VIEW Sitze_Partei_Vor_Ausgleich AS
SELECT wahlID                                                                            as wahl,
       wahlkreisID                                                                       as wahlkreis,
       parteiID                                                                          as partei,
       anz_sitze                                                                         as sitze,
       direct_sitze                                                                      as Direktmandate,
       case when (direct_sitze - anz_sitze > 0) then direct_sitze - anz_sitze else 0 end as Ueberhangmandate
FROM Sitze_Partei_Wahlkreis();


-- berechnen Überhang- und ggf. Ausgleichsmandat
CREATE OR REPLACE FUNCTION calculate_mandate()
    RETURNS VOID AS
$func$
BEGIN
    PERFORM spw.wahlkreisID
    FROM Sitze_Partei_Wahlkreis() spw
    WHERE spw.anz_sitze < spw.direct_sitze;

    while FOUND
        loop
            UPDATE sitze_wahlkreise
            SET mandate = mandate + 1
            WHERE wahlkreis IN (SELECT distinct spw.wahlkreisID
                                FROM Sitze_Partei_Wahlkreis() spw
                                WHERE spw.anz_sitze < spw.direct_sitze
                                  and spw.wahlID = wahl);

            PERFORM spw.wahlkreisID
            FROM Sitze_Partei_Wahlkreis() spw
            WHERE spw.anz_sitze < spw.direct_sitze;
        end loop;
END
$func$ LANGUAGE plpgsql;

do
$$
    begin
        perform calculate_mandate();
    end
$$;

-- Anzahl an Stimmen und Sitze der Partei (über 5 % in Bayern) pro Wahlkreis
CREATE MATERIALIZED VIEW Gesamtstimmen_und_Sitze_Partei AS
SELECT spw.wahlID                                         as wahl,
       spw.wahlkreisID                                    as wahlkreis,
       spw.parteiID                                       as partei,
       spw.stim                                           as Stimmenzahl,
       spw.proz                                           as prozent,
       spw.anz_sitze                                      as sitze,
       spw.direct_sitze                                   as Direktmandate,
       spw.anz_sitze - direct_sitze                       as Listmandate,
       spva.Ueberhangmandate                              as Ueberhangmandate,
       spw.anz_sitze - spva.sitze - spva.Ueberhangmandate as Ausgleichsmandate
FROM Sitze_Partei_Wahlkreis() spw
         INNER JOIN Sitze_Partei_Vor_Ausgleich spva
                    ON spw.wahlID = spva.wahl AND spw.wahlkreisID = spva.wahlkreis AND spw.parteiID = spva.partei;


-- Mitglieder_des_Landtages.
CREATE MATERIALIZED VIEW Mitglieder_des_Landtages AS
-- Anzahl an Zweitstimme für jeden Kandidat in Wahlkreis
WITH Zweitstimme_Kandidat AS
         (SELECT Wahl, Kandidat, count(StimmeID) as Anzahl
          FROM zweitstimme s
          WHERE isValid = 1
          GROUP BY Wahl, Kandidat),
     List_kand AS
         (SELECT zw.*,
                 k.wahlkreis,
                 k.partei,
                 RANK()
                 OVER (PARTITION BY zw.Wahl, k.Wahlkreis, k.Partei ORDER BY zw.Wahl, k.Wahlkreis, k.Partei, COALESCE(zw.Anzahl, 0) + COALESCE(ek.anzahl, 0) DESC) AS Nr
          FROM Zweitstimme_Kandidat zw
                   LEFT JOIN Erststimme_Kandidat ek ON ek.wahl = zw.wahl AND ek.kandidat = zw.kandidat
                   INNER JOIN kandidat k ON zw.kandidat = k.id
          WHERE zw.kandidat NOT IN (SELECT e.Kandidat FROM Erststimme_Gewinner_Pro_Stimmkreis e WHERE e.wahl = zw.wahl))
-- Alle Gewaelte.
SELECT eg.Kandidat, eg.Partei, eg.Wahlkreis, eg.Stimmkreis, eg.Wahl, true as Direktkandidat
FROM Erststimme_Gewinner_Pro_Stimmkreis eg
UNION
SELECT lk.Kandidat, lk.Partei, lk.Wahlkreis, null, lk.Wahl, false as Direktkandidat
FROM List_kand lk
WHERE Nr <= (SELECT Listmandate
             FROM Gesamtstimmen_und_Sitze_Partei gsp
             WHERE gsp.Wahl = lk.Wahl
               AND gsp.Wahlkreis = lk.Wahlkreis
               AND gsp.Partei = lk.Partei);


-- Q6 Knappste Sieger
CREATE MATERIALIZED VIEW Knappste_Sieger_Verlierer AS
WITH erststimmen_stimmkreis AS
         (SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY wahl, wahlkreis, stimmkreis
                     ORDER BY es2.anzahl DESC)                  as rk,
                 es2.Anzahl - (SELECT MAX(anzahl)
                               FROM erststimme_kandidat es
                               WHERE es.Wahl = es2.Wahl
                                 AND es.Stimmkreis = es2.Stimmkreis
                               GROUP BY es.Wahl, es.Stimmkreis) as rueckstand
          FROM erststimme_kandidat es2
          ORDER BY wahl, wahlkreis, stimmkreis, anzahl DESC),
     gewinner_vorsprung as
         (SELECT wahl,
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
     sieger_partei AS
         (SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY wahl, partei
                     ORDER BY vorsprung) as rk
          FROM gewinner_vorsprung gv
          ORDER BY wahl, partei, rk),
     zehn_knappsten_sieger_partei as
         (SELECT *
          FROM sieger_partei
          WHERE rk <= 10),
     partein_ohne_gewinner AS
         (SELECT wahlid, partei
          FROM parteizuwahl pzw
          WHERE partei not in (
              SELECT distinct partei
              FROM sieger_partei sp
              WHERE pzw.wahlid = sp.wahl)),
     am_knappsten_verloren AS
         (SELECT es.Wahl,
                 Wahlkreis,
                 Stimmkreis,
                 es.Partei,
                 Kandidat,
                 Anzahl                        as Erststimmen,
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
SELECT w.id as WahlID, w.jahr, p.parteiname, count(Kandidat) as Anzahl_der_Sitze
FROM Mitglieder_des_Landtages mds
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
       s.nummer     as StimmkreisID,
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
SELECT w.id     as WahlID,
       w.jahr,
       wk.name  as Wahlkreis,
       s.id     as StimmkreisID,
       s.name   as Stimmkreis,
       s.nummer as StimmkreisNr,
       p.parteiname,
       p.einordnung,
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
SELECT w.id    as WahlID,
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

-- die Entwicklung der Stimmen in 2018 im Vergleich zum 2013
CREATE MATERIALIZED VIEW Entwicklung_Stimmen_2018_zum_2013UI AS
SELECT g1.jahr,
       g1.wahlkreis,
       g1.stimmkreisnr,
       g1.stimmkreis,
       g1.parteiname,
       g1.gesamtstimmen,
       g1.prozent,
       g1.prozent - g2.prozent as Diferenz
FROM Gesamtstimmen_Partei_StimmkreisUI g1
         LEFT JOIN Gesamtstimmen_Partei_StimmkreisUI g2
                   ON g1.stimmkreisnr = g2.stimmkreisnr AND g1.parteiname = g2.parteiname
WHERE g2.jahr = '2013'
  AND g1.jahr = '2018'
ORDER BY stimmkreisnr, g1.prozent DESC;

-- Q4 Stimmkreissieger
CREATE MATERIALIZED VIEW StimmkreissiegerUI AS
WITH summary AS
         (SELECT gps.*,
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
SELECT w.id    as WahlID,
       w.jahr,
       wk.id   as wahlkreisID,
       wk.name as wahlkreis,
       p.parteiname,
       gsp.sitze,
       gsp.Ueberhangmandate,
       gsp.Ausgleichsmandate
FROM Gesamtstimmen_und_Sitze_Partei gsp
         INNER JOIN wahl w ON w.id = gsp.wahl
         INNER JOIN wahlkreis wk ON wk.id = gsp.wahlkreis
         INNER JOIN partei p ON p.id = gsp.partei;


-- Q6 Knappste Sieger
CREATE MATERIALIZED VIEW KnappsteSiegerUI AS
SELECT w.id           as WahlID,
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
-- Wahlbeteiligung
CREATE VIEW Wahlbeteiligung_EinzelstimmenUI AS
WITH Anzhal_Stimmen_Stimmkreis AS
         (SELECT e.wahl, e.stimmkreis, count(e.stimmeID) as anzahlstimmen
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

-- Die prozentuale und absolute Anzahl an Stimmen fuer jede Partei.
CREATE VIEW Gesamtstimmen_Partei_Stimmkreis_EinzelstimmenUI AS
SELECT w.jahr,
       wk.name    as Wahlkreis,
       s.name     as Stimmkreis,
       s.nummer   as StimmkreisNr,
       p.parteiname,
       gps.gesamt as gesamtstimmen,
       gps.proz   as prozent,
       gps.erst   as Erststimmen,
       gps.zweit  as Zweitstimmen
FROM Gesamtstimmen_Partei_Stimmkreis() gps
         INNER JOIN stimmkreis s ON gps.stimmkreisID = s.id
         INNER JOIN wahlkreis wk ON wk.id = s.wahlkreis
         INNER JOIN wahl w ON gps.wahlID = w.id
         INNER JOIN partei p ON p.id = gps.parteiID
ORDER BY jahr, StimmkreisNr, prozent DESC;

-- Gewaehlte Direktkandidaten
CREATE VIEW Direktkandidaten_EinzelstimmenUI AS
WITH erststimme_kandidat as
             (SELECT * FROM erststimme_kandidat() ek),
     Partei_Wahlkreis AS
         (SELECT WahlID                                                           as Wahl,
                 (SELECT s.wahlkreis FROM stimmkreis s WHERE s.id = stimmkreisID) as wahlkreis,
                 ParteiID                                                         as Partei,
                 sum(gesamt)                                                      as Gesamtstimmen
          FROM Gesamtstimmen_Partei_Stimmkreis() gps
          GROUP BY Wahl, Wahlkreis, Partei),
     Gesamtstimmen_Wahl as
         (SELECT wahl, sum(Gesamtstimmen) as Gesamtstimmen
          FROM Partei_Wahlkreis
          GROUP BY wahl),
     Partei_Result AS
         (SELECT Wahl,
                 Partei,
                 sum(Gesamtstimmen)                                       as Gesamtstimmen,
                 (sum(Gesamtstimmen) / (SELECT gw.Gesamtstimmen
                                        FROM Gesamtstimmen_Wahl gw
                                        WHERE gw.Wahl = gps2.Wahl)) * 100 as Prozent
          FROM Partei_Wahlkreis gps2
          GROUP BY Wahl, Partei),
     Kandidat_res AS
         (SELECT row_number() over (PARTITION BY wahlID, stimmkreisID ORDER BY wahlID, stimmkreisID, anzahl DESC) as rk,
                 e.*
          FROM erststimme_kandidat e
          WHERE e.parteiID IN (SELECT parteiID FROM Partei_Result p WHERE e.wahlID = p.Wahl AND Prozent >= 5))
SELECT w.jahr,
       wk.name   as Wahlkreis,
       s.id      as StimmkreisID,
       s.name    as Stimmkreis,
       k.vorname,
       k.nachname,
       p.parteiname,
       kr.anzahl as erststimmen
FROM Kandidat_res kr
         INNER JOIN wahl w ON w.id = kr.wahlID
         INNER JOIN wahlkreis wk ON wk.id = kr.wahlkreisID
         INNER JOIN stimmkreis s ON s.id = kr.stimmkreisID
         INNER JOIN kandidat k ON k.id = kr.kandidatID
         INNER JOIN partei p ON p.id = kr.parteiID
WHERE kr.rk = 1;


-- die Entwicklung der Stimmen in 2018 im Vergleich zum 2013
CREATE VIEW Entwicklung_Stimmen_2018_zum_2013_EinzelstimmenUI AS
WITH data AS (SELECT * FROM Gesamtstimmen_Partei_Stimmkreis_EinzelstimmenUI)
SELECT g1.jahr,
       g1.wahlkreis,
       g1.stimmkreisnr,
       g1.stimmkreis,
       g1.parteiname,
       g1.gesamtstimmen,
       g1.prozent,
       g1.prozent - g2.prozent as Diferenz
FROM data g1
         LEFT JOIN data g2
                   ON g1.stimmkreisnr = g2.stimmkreisnr AND g1.parteiname = g2.parteiname
WHERE g2.jahr = '2013'
  AND g1.jahr = '2018'
ORDER BY stimmkreisnr, g1.prozent DESC;


-- Wahlzettel
CREATE OR REPLACE FUNCTION erststimmeWahlzettel(jahrParam integer, stimmkreisParam integer)
    returns TABLE
            (
                jahr       integer,
                wahlkreis  varchar(255),
                stimmkreis varchar(255),
                KandidatID integer,
                vorname    varchar(255),
                nachname   varchar(255),
                parteiname varchar(255)
            )
as
$func$
BEGIN
    RETURN QUERY
        SELECT w.jahr, wk.name, s.name as Stimmkreis, k.id as KandidatID, k.vorname, k.nachname, p.parteiname
        FROM dkandidatzustimmkreis ks
                 INNER JOIN Kandidat k ON k.ID = ks.kandidat
                 INNER JOIN wahl w ON w.id = k.wahlid
                 INNER JOIN stimmkreis s ON s.id = ks.stimmkreis
                 INNER JOIN wahlkreis wk ON wk.id = s.wahlkreis
                 INNER JOIN Partei p ON p.ID = k.partei
        WHERE w.jahr = jahrParam
          AND s.id = stimmkreisParam
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
WITH Gesamtstimmen_Partei_Rank AS
         (SELECT rank() OVER (PARTITION BY gps.Wahl, gps.Partei ORDER BY gps.prozent DESC) as nr, gps.*
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


--Veränderung der Anteil von linken und rechten Parteien zwischen 2018 und 2013
UPDATE partei
SET einordnung = 'l'
WHERE parteiname IN ('GRÜNE', 'DIE LINKE', 'SPD', 'ÖDP');

UPDATE partei
SET einordnung = 'r'
WHERE parteiname IN ('FDP', 'CSU', 'CDU', 'AfD');

CREATE MATERIALIZED VIEW Partei_Einordnung_AnalyseUI AS
WITH data AS
         (SELECT wahlid,
                 wahlkreis,
                 stimmkreisnr,
                 stimmkreis,
                 einordnung,
                 sum(prozent) as prozent
          FROM Gesamtstimmen_Partei_StimmkreisUI
          WHERE einordnung IN ('l', 'r')
          GROUP BY wahlid, wahlkreis, stimmkreisnr, stimmkreis, einordnung),
     differenz_2018_2013 AS
         (SELECT d1.wahlkreis,
                 d1.stimmkreisnr,
                 d1.stimmkreis,
                 d1.einordnung,
                 d1.prozent - d2.prozent as differenz
          FROM data d1
                   INNER JOIN data d2 ON d1.wahlid = 2
              AND d2.wahlid = 1
              AND d1.stimmkreisnr = d2.stimmkreisnr AND d1.einordnung = d2.einordnung),
     differenz_r_l AS
         (SELECT d1.Wahlkreis,
                 d1.StimmkreisNr,
                 d1.Stimmkreis,
                 d1.differenz                                                 as Change_Left,
                 d2.differenz                                                 as Change_Right,
                 abs(d1.differenz - d2.differenz)                             as change,
                 rank() over (ORDER BY abs(d1.differenz - d2.differenz) DESC) as rk,
                 CASE
                     WHEN d1.differenz < d2.differenz
                         THEN 'Swing from left to right'
                     ELSE 'Swing from right to left'
                     END
          FROM differenz_2018_2013 d1
                   INNER JOIN differenz_2018_2013 d2
                              ON d1.StimmkreisNr = d2.StimmkreisNr AND d1.einordnung = 'l' AND d2.einordnung = 'r')
SELECT *
FROM differenz_r_l
WHERE rk <= 10;