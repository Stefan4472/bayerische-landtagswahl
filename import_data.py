import bs4
import dataclasses
import enum


@dataclasses.dataclass(eq=True, frozen=True)
class Candidate:
    first_name: str
    last_name: str
    party: str


@dataclasses.dataclass
class DirectCandidate:
    candidate: Candidate
    region_key: int
    num_votes: int


@dataclasses.dataclass
class ListCandidate:
    candidate: Candidate
    # Results: a tuple of (region_key, num_votes)
    results: list[tuple[int, int]] = dataclasses.field(default_factory=list)


class VoteType(enum.Enum):
    Erst = 1
    Zweit = 2


def get_vote_type(stimmentype: str) -> VoteType:
    if stimmentype == 'Zweitstimmen':
        return VoteType.Zweit
    elif stimmentype == 'Erststimmen':
        return VoteType.Erst
    else:
        raise ValueError('Unrecognized "stimmentype": {}'.format(stimmentype))


with open('data/wahl-2018-overview-sample.xml') as f:
    # Parse the XML using the lxml parser (very fast)
    soup = bs4.BeautifulSoup(f, 'lxml-xml')

# Map region keys to names
region_key_to_name: dict[int, str] = {}

# Get the name and key for each region
for region_data in soup.Ergebnisse.find_all('Regionaleinheit'):
    key = int(region_data.Allgemeine_Angaben.Schluesselnummer.contents[0].strip())
    name = region_data.Allgemeine_Angaben.Name_der_Regionaleinheit.contents[0].strip()
    region_key_to_name[key] = name

print('Got region keys {}'.format(region_key_to_name))


with open('data/wahl-2018-ergebnisse-sample.xml') as f:
    soup = bs4.BeautifulSoup(f, 'lxml-xml')

# Track set of found political groups/parties
parties: set[str] = set()
# Build list of Candidates found
candidates: list[Candidate] = []
# Map Candidate->DirectCandidate results
direct_candidates: dict[Candidate, DirectCandidate] = {}
# Map Candidate->ListCandidate results
list_candidates: dict[Candidate, ListCandidate] = {}

# Iterate over Wahlkreise
for wahlkreis_data in soup.Ergebnisse.find_all('Wahlkreis'):
    wahlkreis_name = wahlkreis_data.Name.contents[0].strip()

    # Iterate over parties in the Wahlkreis
    for party_data in wahlkreis_data.find_all('Partei'):
        party_name = party_data.Name.contents[0].strip()
        parties.add(party_name)
    
        # Iterate over candidates in the party
        for candidate_data in party_data.find_all('Kandidat'):
            candidate = Candidate(
                candidate_data.Vorname.contents[0].strip(),
                candidate_data.Nachname.contents[0].strip(),
                party_name,
            )
            candidates.append(candidate)

            # gesamt_stimmen = candidate_data.Gesamtstimmen.contents[0]
            # zweit_stimmen = candidate_data.Zweitstimmen.contents[0]
            is_direct: bool = False
            is_list: bool = False
            as_list_candidate = ListCandidate(candidate)

            # Iterate over Stimmkreise that the candidate appeared in
            for stimmkreis_data in candidate_data.find_all('Stimmkreis'):
                region_key = int(stimmkreis_data.NrSK.contents[0].strip())
                num_votes = int(stimmkreis_data.NumStimmen.contents[0].strip())
                vote_type = get_vote_type(stimmkreis_data.NumStimmen['Stimmentyp'])

                if vote_type == VoteType.Erst:
                    is_direct = True
                    direct_candidates[candidate] = DirectCandidate(
                        candidate,
                        region_key,
                        num_votes,
                    )
                elif vote_type == VoteType.Zweit:
                    is_list = True
                    as_list_candidate.results.append((
                        region_key, 
                        num_votes,
                    ))

            if is_list:
                list_candidates[candidate] = as_list_candidate

    print(list_candidates.values())