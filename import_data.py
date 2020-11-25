import bs4
import dataclasses


@dataclasses.dataclass
class Candidate:
    first_name: str
    last_name: str
    party: str


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

candidates_list: list[Candidate] = []
parties_set: set[str] = set()

for wahlkreis_data in soup.Ergebnisse.find_all('Wahlkreis'):
    wahlkreis_name = wahlkreis_data.Name.contents[0]
    print(wahlkreis_name)
    # Iterate over parties in the Wahlkreis
    for party_data in wahlkreis_data.find_all('Partei'):
        party_name = party_data.Name.contents[0]
        parties_set.add(party_name)
        # Iterate over candidates in the party
        for candidate_data in party_data.find_all('Kandidat'):
            candidates_list.append(Candidate(
                candidate_data.Vorname.contents[0].strip(),
                candidate_data.Nachname.contents[0].strip(),
                party_name,
            ))

print(parties_set)
print('Candidates:')
for c in candidates_list:
    print(c)