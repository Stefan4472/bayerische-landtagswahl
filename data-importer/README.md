## Data Importer
This directory contains a Python 3.9 program written to parse XML election data, import it into a database, and generate individual vote records according to our schema.

## Codebase
- `data_importer.py`: Given in-memory election data, imports into the database and generates voting records
- `data_parser.py`: Provides functions to parse XML election data
- `database.py`: Abstraction of the MySQL database connection
- `manage_db.py`: Command-line tool to run a SQL script or to import data from XML and generate vote records
- `util.py`: Various utility methods and classes used throughout the code

## Setup
TODO: MORE DETAIL
- Install Python 3.9
- Setup a virtual environment
- Use pip to install the libraries listed in `requirements.txt`

## Usage
Run a SQL script, for example, `sql-scripts/CreateDB.sql`:
```
> cd data-importer
> python manage_db.py run_script "../SQL scripts/CreateDB.sql" --password=[YOUR_MYSQL_PASSWORD]
```

Import XML election data, for example `data/2018-info.xml` and `data/2018-results.xml`:
```
> cd data-importer
> python manage_db.py import_data ../data/2018-info.xml ../data/2018-results-sample.xml --year=2018 --password=[YOUR_MYSQL_PASSWORD] --db_name=bayerische_landtagswahl
```

## Unofficial benchmark data for importing/generating election data
*(using time.time(), which isn't super accurate)*

Sample dataset:
- with console print: data-import: 43.3 sec
- without print: 42.5 sec
- without print, with bulk-insert=5000: 42.4 sec
- without print, with bulk-insert=10000: 43.4 sec
- without print, with bulk-insert=2000: 40.67 sec
- without print, with bulk-insert=1000: 41.01 sec

Full dataset:
- without print, with bulk-insert=2000: 334.20 sec
