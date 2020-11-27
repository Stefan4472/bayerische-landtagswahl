# bayerische-landtagswahl
DatenbankSysteme Prof. Kemper

## Data Importer
The `data-importer-python` directory contains a Python 3.9 tool written to parse XML election data. This can be found in `import_data.py`.

To run `import_data.py`, use `pip` to install the libraries listed in `data-importer-python/requirements.txt`. From the `data-importer-python` directory, run:

```
python import_data.py
```

This script is in early stages, and does not currently take arguments (a command-line tool is being developed in `data-importer-python/manage_db.py`). However, you can see in the code that the following data structures are created:

```
`region_key_to_name`: maps integer region key to name of the region
`parties`: set of all political party names found in the xml
`candidates`: list of all Candidates found in the xml
`all_direct_results`: maps `Candidate` instances to their direct vote results **for those candidates who ran as direct candidates**
`all_list_results`: maps `Candidate` instances to their list vote results, which stores the number of second votes they received in each Stimmkreis
`zweit_ohne_kandidat`: maps party name->(Stimmkreis, number of second votes received that did not name a candidate)