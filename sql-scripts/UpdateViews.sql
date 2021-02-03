REFRESH MATERIALIZED VIEW Erststimme_Kandidat;
REFRESH MATERIALIZED VIEW Gesamtstimmen_Partei_Stimmkreis;
REFRESH MATERIALIZED VIEW Gesamtstimmen_Partei_Wahl;
REFRESH MATERIALIZED VIEW Erststimme_Gewinner_Pro_Stimmkreis;
do
$$
    begin
        perform create_sitze_wahlkreise_table();
    end
$$;
REFRESH MATERIALIZED VIEW Sitze_Partei_Vor_Ausgleich;
-- recalculate Überhang- und ggf. Ausgleichsmandate
do
$$
    begin
        perform calculate_mandate();
    end
$$;
REFRESH MATERIALIZED VIEW Gesamtstimmen_und_Sitze_Partei;
REFRESH MATERIALIZED VIEW Mitglieder_des_Landtages;
REFRESH MATERIALIZED VIEW Knappste_Sieger_Verlierer;
REFRESH MATERIALIZED VIEW Sitzverteilung;
REFRESH MATERIALIZED VIEW Mitglieder_des_LandtagesUI;
REFRESH MATERIALIZED VIEW WahlbeteiligungUI;
REFRESH MATERIALIZED VIEW Gesamtstimmen_Partei_StimmkreisUI;
REFRESH MATERIALIZED VIEW DirektkandidatenUI;
REFRESH MATERIALIZED VIEW Entwicklung_Stimmen_2018_zum_2013UI;
REFRESH MATERIALIZED VIEW StimmkreissiegerUI;
REFRESH MATERIALIZED VIEW UeberhangmandateUI;
REFRESH MATERIALIZED VIEW KnappsteSiegerUI;
REFRESH MATERIALIZED VIEW KnappsteVerliererUI;
REFRESH MATERIALIZED VIEW ErststimmenKandidatStimmkreisUI;
REFRESH MATERIALIZED VIEW Beste_Stimmkreise_ParteiUI;