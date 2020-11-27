import bs4
import dataclasses
import pathlib
import typing
from util import StimmKreis, Candidate, DirectResult, \
    ListResults, VoteType, get_vote_type


class ParsedInfoXML(typing.NamedTuple):
    stimmkreis_name_lookup: dict[int, str]
    stimmkreise: dict[int, StimmKreis]


def parse_info_xml(filepath: pathlib.Path) -> ParsedInfoXML: 
    # Parse the XML using the lxml parser (very fast)
    with open(filepath) as f:
        soup = bs4.BeautifulSoup(f, 'lxml-xml')

    # Map stimmkreis ID to name
    stimmkreis_name_lookup: dict[int, str] = {}
    # Build map of stimmkreis_id->Stimmkreis
    stimmkreise: dict[int, StimmKreis] = {}

    # Parse region data
    for region_data in soup.Ergebnisse.find_all('Regionaleinheit'):
        key = int(region_data.Allgemeine_Angaben.Schluesselnummer.contents[0].strip())
        name = region_data.Allgemeine_Angaben.Name_der_Regionaleinheit.contents[0].strip()
        # Add key to lookup
        stimmkreis_name_lookup[key] = name
        # Create Stimmkreis instance and add to mapping
        stimmkreise[key] = StimmKreis(
            key,
            int(region_data.Allgemeine_Angaben.Stimmberechtigte.contents[0].strip()),
            int(region_data.Allgemeine_Angaben.Waehler.contents[0].strip()),
        )

    return ParsedInfoXML(
        stimmkreis_name_lookup, 
        stimmkreise,
    )


class ParsedResultsXML(typing.NamedTuple):
    parties: set[str]
    candidates: list[Candidate]
    direct_results: dict[Candidate, DirectResult]
    list_results: dict[Candidate, ListResults]
    party_only_votes: dict[str, dict[int, int]]


def parse_results_xml(filepath: pathlib.Path) -> ParsedResultsXML:
    with open(filepath) as f:
        soup = bs4.BeautifulSoup(f, 'lxml-xml')

    # Track set of found political groups/parties
    parties: set[str] = set()
    # Build list of Candidates found
    candidates: list[Candidate] = []
    # Map Candidate->DirectCandidate results
    all_direct_results: dict[Candidate, DirectResult] = {}
    # Map Candidate->ListCandidate results
    all_list_results: dict[Candidate, ListResults] = {}

    # Iterate over Wahlkreise
    for wahlkreis_data in soup.Ergebnisse.find_all('Wahlkreis'):
        wahlkreis_name = wahlkreis_data.Name.contents[0].strip()

        # Iterate over parties in the Wahlkreis
        for party_data in wahlkreis_data.find_all('Partei'):
            party_name = party_data.Name.contents[0].strip()
            parties.add(party_name)
        
            # Iterate over candidates in the party
            for candidate_data in party_data.find_all('Kandidat'):
                # Instantiate a `Candidate` instance
                candidate = Candidate(
                    candidate_data.Vorname.contents[0].strip(),
                    candidate_data.Nachname.contents[0].strip(),
                    party_name,
                )
                candidates.append(candidate)

                is_direct: bool = False
                is_list: bool = False
                list_results = ListResults(candidate)

                # Iterate over Stimmkreise that the candidate appeared in
                for stimmkreis_data in candidate_data.find_all('Stimmkreis'):
                    region_key = int(stimmkreis_data.NrSK.contents[0].strip())
                    num_votes = int(stimmkreis_data.NumStimmen.contents[0].strip())
                    vote_type = get_vote_type(stimmkreis_data.NumStimmen['Stimmentyp'])

                    # Candidate received "Erststimmen" in this Stimmkreis:
                    # Mark them as a direct candidate for this `region_key`
                    if vote_type == VoteType.Erst:
                        is_direct = True
                        all_direct_results[candidate] = DirectResult(
                            candidate,
                            region_key,
                            num_votes,
                        )
                    # Candidate received "Zweitstimmen" in this Stimmkreis:
                    # Mark them as a list candidate and add the results for this
                    # Stimmkreis to their "ListCandidate" results
                    elif vote_type == VoteType.Zweit:
                        is_list = True
                        list_results.results.append((
                            region_key, 
                            num_votes,
                        ))

                if is_list:
                    all_list_results[candidate] = list_results

        # print(list_results.values())

    # Store ZweitStimmen without a listed candidate for each party, for each Stimmkreis.
    # dict[(str) partei][(int) region_key] = (int) num_votes
    # Init with empty dictionaries for each known party.
    zweit_ohne_kandidat: dict[str, dict[int, int]] = {
        party_name: {} for party_name in parties
    }

    # Iterate over Wahlkreise
    for wahlkreis_data in soup.Ergebnisse.find_all('Wahlkreis'):
        # Iterate over parties in the Wahlkreis
        for party_data in wahlkreis_data.find_all('Partei'):
            party_name = party_data.Name.contents[0].strip()
            # Iterate over the Stimmkreise in the *first* candidate listed
            for stimmkreis_data in party_data.Kandidat.find_all('Stimmkreis'):
                region_key = int(stimmkreis_data.NrSK.contents[0].strip())
                votes_no_candidate = int(stimmkreis_data.ZweitSohneKandidat.contents[0].strip())
                # Add to map
                zweit_ohne_kandidat[party_name][region_key] = votes_no_candidate

    return ParsedResultsXML(
        parties,
        candidates,
        all_direct_results,
        all_list_results,
        zweit_ohne_kandidat,
    )


def write_to_json(
    year: int,
    xml_info: ParsedInfoXML,
    xml_results: ParsedResultsXML,
):
    return

    
print(parse_info_xml(pathlib.Path('../data/2018-info.xml')))
print(parse_results_xml(pathlib.Path('../data/wahl-2018-ergebnisse-sample.xml')))