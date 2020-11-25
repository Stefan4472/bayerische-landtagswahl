import bs4


with open('data/wahl-2018-overview-sample.xml') as f:
    # Parse the XML using the lxml parser (very fast)
    soup = bs4.BeautifulSoup(f, 'lxml-xml')

# Get the name and key for each listen region
for region_data in soup.Ergebnisse.find_all('Regionaleinheit'):
    key = region_data.Allgemeine_Angaben.Schluesselnummer.contents[0]
    name = region_data.Allgemeine_Angaben.Name_der_Regionaleinheit.contents[0]
    print('{}: {}'.format(key, name))

with open('data/wahl-2018-ergebnisse-sample.xml') as f:
    soup = bs4.BeautifulSoup(f, 'lxml-xml')

print('Candidates:')

for wahlkreis_data in soup.Ergebnisse.find_all('Wahlkreis'):
    wahlkreis_name = wahlkreis_data.Name.contents[0]
    print(wahlkreis_name)
    # Iterate over parties in the Wahlkreis
    for party_data in wahlkreis_data.find_all('Partei'):
        party_name = party_data.Name.contents[0]
        # Iterate over candidates in the party
        for candidate_data in party_data.find_all('Kandidat'):
            print('{} {} ({})'.format(
                candidate_data.Vorname.contents[0].strip(),
                candidate_data.Nachname.contents[0].strip(),
                party_name,
            ))
