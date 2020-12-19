-- Q3 Stimmkreisuebersicht

-- Direktkandidaten
SELECT w.jahr,
       wk.name as Wahlkreis,
       s.id as StimmkreisID,
       s.name as Stimmkreis,
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
