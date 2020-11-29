import mysql.connector
import database as db
import data_parser


# TODO: SOME KIND OF "ELECTION_RESULTS" CONTAINER TO AGGREGATE ALL INFO FROM INFO AND RESULTS XML (AND YEAR)
def run_import(
    database: db.Database,
    info_xml: data_parser.ParsedInfoXML,
    results_xml: data_parser.ParsedResultsXML,
    year: int,
):
    cur = database.get_cursor()

    # Add Wahl to database and get wahlID
    if database.has_wahl(year):
        wahl_id = database.get_wahl_id(year)
    else:
        database.add_wahl(year)
        wahl_id = database.get_wahl_id(year)
    print(wahl_id)
    
    # Add Stimmkreis data and TODO: record IDs
    for stimmkreis in info_xml.stimmkreise.values():
        stimmkreis_id = database.add_stimmkreis(
            wahl_id,
            stimmkreis,
        )

    # Add Party data and TODO: record IDs
    for party_name in results_xml.parties:
        party_id = database.add_party(
            wahl_id,
            party_name,
        )
