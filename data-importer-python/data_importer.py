import mysql.connector
import database as db
import util
import data_parser


# TODO: SOME KIND OF "ELECTION_RESULTS" CONTAINER TO AGGREGATE ALL INFO FROM INFO AND RESULTS XML (AND YEAR)
def run_import(
    database: db.Database,
    info_xml: data_parser.ParsedInfoXML,
    results_xml: data_parser.ParsedResultsXML,
    year: int,
):
    # Add Wahl to database and get wahlID
    if database.has_wahl(year):
        wahl_id = database.get_wahl_id(year)
    else:
        database.add_wahl(year)
        wahl_id = database.get_wahl_id(year)
    
    # Map stimmkreis number to in-database ID
    stimmkreis_id_lookup: dict[int, int] = {}

    # Add Stimmkreis data and record IDs
    for stimmkreis in info_xml.stimmkreise.values():
        stimmkreis_id = database.add_stimmkreis(
            wahl_id,
            stimmkreis,
        )
        stimmkreis_id_lookup[stimmkreis.region_id] = stimmkreis_id

    # Map party names to in-database ID
    party_id_lookup: dict[str, int] = {}

    # Add Party data and record IDs
    for party_name in results_xml.parties:
        party_id = database.add_party(
            wahl_id,
            party_name,
        )
        party_id_lookup[party_name] = party_id

    # Map Candidate instances to in-database ID
    candidate_id_lookup: dict[util.Candidate, int] = {}

    # Add Candidate data and record IDs
    for candidate in results_xml.candidates:
        candidate_id = database.add_candidate(
            wahl_id,
            candidate,
            party_id_lookup[candidate.party],
        )
        candidate_id_lookup[candidate] = candidate_id
