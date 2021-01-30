# bayerische-landtagswahl
This is a semester-project for the Database Systems class taught by Professor Alfons Kemper, Winter 2020, in the Elite Software Engineering Master's Program at the University of Augsburg | Technical University of Munich | Ludwig Maximillian University of Munich.

The goal of the project was to develop a online elections-system that could handle the Bavarian Parliamentary elections.
# Overview
- `backend`: Code for the Flask backend
- `benchmarker`: A benchmarking program (no longer used)
- `data`: XML data from the 2013 and 2018 elections
- `database`: Code for the election database. Contains a Python package called `landtagswahldb`
- `documentation`: Contains a few documents we had to create at the beginning of the project
- `frontend`: Code for the React frontend
- `loadtesting`: Locustfile definitions used for load-testing with the Python `locust` framework
- `mockup`: HTML code from our first website mockup
- `sql-scripts`: SQL scripts used with the database

# Requirements
- Python 3.9
- Node and NPM
- Postgres

# Setup

*Note: It is recommended you install all Python packages into their own virtual environment.*

## Install the internal database package

You need to install our `landtagswahldb` package.

```
cd database
pip install wheel
pip install .
```

## Set up the database

`cd` into `database` and install the required Python packages:

```
pip install -r requirements.txt
```

Note: for each of the following commands, you will be prompted to enter your Postgres password. To avoid the prompt, you can provide your password as an option: `--password=[YOUR_POSTGRES_PASSWORD]`

Use the `manage_db.py` script to set up a database with the proper schema. In this case, we'll create a new Postgres database called "bayerische_landtagswahl":
```
python manage_db.py reset ../sql-scripts/PostgresSchema.sql --db_name=bayerische_landtagswahl
```

Now import the XML election data and generate votes for the 2013 and 2018 elections (contained in `data/2018-info.xml` and `data/2018-results.xml`):
```
python manage_db.py import_data ../../../data/2013-info.xml ../../../data/2013-results.xml --year=2013 --db_name=bayerische_landtagswahl
python manage_db.py import_data ../../../data/2018-info.xml ../../../data/2018-results.xml --year=2018 --db_name=bayerische_landtagswahl
```

Now run the script to create materialized views (`sql-scripts/Landtagswahl_Calculation.sql`):
```
python manage_db.py runscript ../sql-scripts/Landtagswahl_Calculation.sql --db_name=bayerische_landtagswahl
```

## Set up the Flask backend

`cd` into `backend` and install the required Python packages:

```
pip install -r requirements.txt
```

Edit `instance/db-config.json`, inserting the values you need to connect to your database. Make sure not to commit `instance/db-config.json` after you've entered your password!

## Set up the React frontend

Install the required NPM packages:

```
cd frontend
npm install
```

# Run

Once you have your database correctly set up, you can run the website.

First, start the Flask server. Instructions from [the Flask Tutorial](https://flask.palletsprojects.com/en/1.1.x/tutorial/factory/#run-the-application):
```
cd backend
```

And then...

```
For Linux and Mac:
$ export FLASK_APP=flaskr
$ export FLASK_ENV=development
$ flask run

For Windows cmd, use set instead of export:
> set FLASK_APP=flaskr
> set FLASK_ENV=development
> flask run

For Windows PowerShell, use $env: instead of export:
> $env:FLASK_APP = "flaskr"
> $env:FLASK_ENV = "development"
> flask run
```

You should now see a console message that the server is running on `127.0.0.1:5000`. To make sure it's working, open a web browser and go to one of the API endpoints, e.g. `http://127.0.0.1/api/results/2018/sitzverteilung`

Next, in a separate terminal, start the React server:
```
cd frontend
npm start
```

# Voting

To simulate submitting a vote, use the voterkey-generation tool (`database/voter_setup.py`). This tool generates random voter keys and registers them with the server. These keys can then be copy-and-pasted into the "Voter Key" box on the `Stimmabgabe` page.

Example usage: Generate 10 voter keys for the 2018 election in Stimmkreis #105:
```
python voter_setup.py 2018 105 -n 10
```

# Load Testing

We originally wrote our own program to perform load testing (in the `benchmarker` directory). However, we later learned about [Locust](https://locust.io/), a Python load-testing framework, and have adopted it for use. You will find our load-test definitions in the `loadtesting` directory. Please follow the instructions in the `Readme` there.
