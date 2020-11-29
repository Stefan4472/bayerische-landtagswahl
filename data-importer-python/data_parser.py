import bs4
import dataclasses
import pathlib
import typing
import json
from util import StimmKreis, Candidate, DirectResult, \
    ListResults, VoteType, get_vote_type


class ParsedInfoXML(typing.NamedTuple):
    stimmkreis_name_lookup: dict[int, str]
    stimmkreise: dict[int, StimmKreis]


def parse_info_xml(filepath: pathlib.Path) -> ParsedInfoXML: 
    # Parse the XML using the lxml parser (very fast)
    with open(filepath, encoding='utf-8') as f:
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
    with open(filepath, encoding='utf-8') as f:
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
                    wahlkreis_name,
                )
                candidates.append(candidate)

                # Instantiate `ListResults` object to collect their results
                list_results = ListResults(candidate)

                # Iterate over Stimmkreise that the candidate appeared in
                for stimmkreis_data in candidate_data.find_all('Stimmkreis'):
                    region_key = int(stimmkreis_data.NrSK.contents[0].strip())
                    num_votes = int(stimmkreis_data.NumStimmen.contents[0].strip())
                    vote_type = get_vote_type(stimmkreis_data.NumStimmen['Stimmentyp'])

                    # Candidate received "Erststimmen" in this Stimmkreis:
                    # Add their direct results for this `region_key`
                    if vote_type == VoteType.Erst:
                        all_direct_results[candidate] = DirectResult(
                            candidate,
                            region_key,
                            num_votes,
                        )
                    # Candidate received "Zweitstimmen" in this Stimmkreis:
                    # Add the results for this Stimmkreis to their "ListResults" 
                    # instance
                    elif vote_type == VoteType.Zweit:
                        list_results.results.append((
                            region_key, 
                            num_votes,
                        ))

                # Add results to the mapping
                all_list_results[candidate] = list_results

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


# NOTE: THIS METHOD WILL BE REMOVED
def write_to_json(
    year: int,
    xml_info: ParsedInfoXML,
    xml_results: ParsedResultsXML,
    dump_file: pathlib.Path,
):
    root_dict: dict[str, typing.Any] = {}
    root_dict['year'] = year
    root_dict['stimmkreis_ids'] = xml_info.stimmkreis_name_lookup
    root_dict['stimmkreis_data'] = \
        {key: dataclasses.asdict(s) for key, s in xml_info.stimmkreise.items()}
    root_dict['parties'] = list(xml_results.parties)
    root_dict['candidates'] = \
        [dataclasses.asdict(c) for c in xml_results.candidates]
    root_dict['list_results'] = \
        [dataclasses.asdict(r) for r in xml_results.list_results]
    root_dict['direct_results'] = \
        [dataclasses.asdict(r) for r in xml_results.direct_results]
    root_dict['party_only_votes'] = xml_results.party_only_votes

    # Write out to specified file
    with open(dump_file, 'w', encoding='utf-8') as f:
        json.dump(root_dict, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    year = 2018
    xml_info = parse_info_xml(pathlib.Path('../data/2018-info.xml'))
    xml_results = parse_results_xml(pathlib.Path('../data/2018-results.xml'))

    write_to_json(year, xml_info, xml_results, pathlib.Path('../data/wahl-2018.json'))