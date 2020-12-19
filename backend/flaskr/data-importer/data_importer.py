# Note: This is a path hack to get access to code in the parent directory.
# TODO: FIGURE OUT HOW TO DO THIS PROPERLY WITH PACKAGES
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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
        stimmkreis_id_lookup[stimmkreis.number] = stimmkreis_id

    # Map party names to in-database ID
    party_id_lookup: dict[str, int] = {}

    # Add Party data and record IDs
    for party_name in results_xml.parties:
        if database.has_party(party_name):
            party_id = database.get_party_id(party_name)
        else:
            party_id = database.add_party(
                party_name,
            )
        database.add_party_to_election(
            party_id,
            wahl_id,
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

    # Generate Erst-Stimmen
    for candidate, direct_result in results_xml.direct_results.items():
        candidate_id = candidate_id_lookup[candidate]
        stimmkreis_id = stimmkreis_id_lookup[direct_result.stimmkreis_id]
        num_votes = direct_result.num_votes
        
        database.generate_erst_stimmen(
            wahl_id,
            candidate_id,
            stimmkreis_id,
            num_votes,
        )

    # Generate Zweit-Stimmen
    for candidate, list_results in results_xml.list_results.items():
        candidate_id = candidate_id_lookup[candidate]
        # Iterate over Stimmkreise for this candidate
        for stimmkreis_result in list_results.results:
            # Look up the in-database ID of the stimmkreis
            stimmkreis_id = stimmkreis_id_lookup[stimmkreis_result.stimmkreis_nr]
        
            database.generate_zweit_stimmen(
                wahl_id,
                candidate_id,
                stimmkreis_id,
                stimmkreis_result.num_votes,
            )

    # Generate Zweit-Stimmen for which no candidate was specified
    for party_name, votes_by_stimmkreis in results_xml.party_only_votes.items():
        party_id = party_id_lookup[party_name]
        # Iterate over Stimmkreise for this party
        for stimmkreis_num, num_votes in votes_by_stimmkreis.items():
            stimmkreis_id = stimmkreis_id_lookup[stimmkreis_num]
            num_votes = num_votes
        
            database.generate_zweit_stimmen_ohne_kandidat(
                wahl_id,
                party_id,
                stimmkreis_id,
                num_votes,
            )

    database.commit()
