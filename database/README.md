## Usage
Reset the database to use a specified schema:
```
python manage_db.py reset ../sql-scripts/PostgresSchema.sql --db_name=bayerische_landtagswahl
```

Import XML election data, for example `data/2018-info.xml` and `data/2018-results.xml`:
```
python manage_db.py import_data ../data/2018-info.xml ../data/2018-results.xml --year=2018 --db_name=bayerische_landtagswahl
```

Run the script to calculate materialized views: `sql-scripts/Landtagswahl_Calculation.sql`
```
python manage_db.py runscript ../sql-scripts/Landtagswahl_Calculation.sql --db_name=bayerische_landtagswahl
```

In each case, you will be prompted to enter your Postgres password. To avoid the prompt, you can provide your password as a flag: `--password=[YOUR_POSTGRES_PASSWORD`

Data import and generation takes a little under a minute each for 2013 and 2018.