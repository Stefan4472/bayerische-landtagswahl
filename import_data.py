import bs4
import dataclasses
import enum


@dataclasses.dataclass
class Candidate:
    first_name: str
    last_name: str
    party: str


@dataclasses.dataclass
class DirectCandidate:
    candidate: Candidate
    region_key: int
    num_votes: int


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
    key = region_data.Allgemeine_Angaben.Schluesselnummer.contents[0]
    name = region_data.Allgemeine_Angaben.Name_der_Regionaleinheit.contents[0]
    region_key_to_name[key] = name

print('Got region keys {}'.format(region_key_to_name))


with open('data/wahl-2018-ergebnisse-sample.xml') as f:
    soup = bs4.BeautifulSoup(f, 'lxml-xml')

candidates: list[Candidate] = []
# TODO: map by candidate key
direct_candidates: list[DirectCandidate] = []
parties: set[str] = set()

for wahlkreis_data in soup.Ergebnisse.find_all('Wahlkreis'):
    wahlkreis_name = wahlkreis_data.Name.contents[0]
    print(wahlkreis_name)

    # Iterate over parties in the Wahlkreis
    for party_data in wahlkreis_data.find_all('Partei'):
        party_name = party_data.Name.contents[0]
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

            # Iterate over Stimmkreise that the candidate appeared in
            for stimmkreis_data in candidate_data.find_all('Stimmkreis'):
                region_key = stimmkreis_data.NrSK.contents[0]
                num_votes = stimmkreis_data.NumStimmen.contents[0]
                vote_type = get_vote_type(stimmkreis_data.NumStimmen['Stimmentyp'])

                if vote_type == VoteType.Erst:
                    is_direct = True
                    print('Found direct candidate: {}'.format(candidate))
                    direct_candidates.append(DirectCandidate(
                        candidate,
                        region_key,
                        num_votes,
                    ))
