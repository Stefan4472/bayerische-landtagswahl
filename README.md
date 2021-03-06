# bayerische-landtagswahl
This is a semester-project for the Database Systems class taught by Professor Alfons Kemper, Winter 2020, in the Elite Software Engineering Master's Program at the University of Augsburg | Technical University of Munich | Ludwig Maximillian University of Munich.

The goal of the project is to develop an online elections-system for the Bavarian Parliamentary elections.

# Overview

The backend is written in Python Flask, and the frontend is written using ReactJS and Bootstrap. For our database, we used PostgreSQL.

Directories:
- `backend`: Code for the Flask backend
- `benchmarker`: A benchmarking program (no longer used)
- `data`: XML data from the 2013 and 2018 elections
- `database`: Code for the election database. Contains a Python package called `landtagswahldb`
- `documentation`: A few documents describing the software's requirements
- `frontend`: Code for the React frontend
- `loadtesting`: Locustfile definitions used for load-testing with the Python `locust` framework
- `mockup`: HTML code from our first website mockup
- `sql-scripts`: SQL scripts used with the database

# Requirements
- Python 3.9
- Node and NPM
- Postgres

# Setup

*Note: It is recommended you install all Python packages into a virtual environment.*

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

Use the `manage_db.py` script to set up a database with the proper schema. In this case, we'll create a new Postgres database called "bayerische_landtagswahl"

*Note: for each of the following commands, you will be prompted to enter your Postgres password. To avoid the prompt, you can provide your password as an option: `--password=[YOUR_POSTGRES_PASSWORD]`*

```
python manage_db.py reset ../sql-scripts/PostgresSchema.sql --db_name=bayerische_landtagswahl
```

Now import the XML election data and generate votes for the 2013 and 2018 elections:
```
python manage_db.py import_data ../data/2013-info.xml ../data/2013-results.xml --year=2013 --db_name=bayerische_landtagswahl
python manage_db.py import_data ../data/2018-info.xml ../data/2018-results.xml --year=2018 --db_name=bayerische_landtagswahl
```

Now run the script to crunch the election data and generate statistics (`sql-scripts/Landtagswahl_Calculation.sql`):
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

# Production

The simplest way (which is also cross-platform) to get started on a production server is to install [waitress](https://docs.pylonsproject.org/projects/waitress/en/stable/).

```
pip install waitress
cd backend
waitress-serve --port=5000 --call "flaskr:create_app"
```

You can change the number of worker threads used like so:

```
waitress-serve --port=5000 --threads=10 --call "flaskr:create_app"
```

For higher performance, we recommend using a production server such as [uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/index.html)

## Performance Notes

Tested on Intel Core i5-7300HQ CPU @ 2.50 GHz, 16GB RAM on a Flask development server.


|                                     | 1 user, 1 sec. wait. n=460 | 50 users, 5 sec wait, n=2200 | 500 users, 5 sec wait, n=35000 | 250 users, 1 sec wait, n=35000 | 500 users, 1 sec wait, n=50000 |
|-------------------------------------|----------------------------|------------------------------|--------------------------------|--------------------------------|--------------------------------|
| Avg. RPS                            | 1.0                        | 9.6                          | 98.9                           | 160.9                          | 186.2                          |
| Failure Rate                        | 0.0%                       | 0.001%*                      | 0.002%*                        | 0.003%*                        | 14.6%                          |
| /api/results/2018/sitzverteilung    | 5 ms                       | 9 ms                         | 32 ms                          | 530 ms                         | 1630 ms                        |
| /api/results/2018/mitglieder        | 13 ms                      | 20 ms                        | 42 ms                          | 539 ms                         | 1630 ms                        |
| /api/results/2018/stimmkreis        | 5 ms                       | 10 ms                        | 37 ms                          | 535 ms                         | 1638 ms                        |
| /api/results/2018/stimmkreis-sieger | 7 ms                       | 12 ms                        | 37 ms                          | 533 ms                         | 1619 ms                        |
| /api/results/2018/ueberhangmandate  | 10 ms                      | 11 ms                        | 36 ms                          | 533 ms                         | 1619 ms                        |
| /api/results/2018/knappste-sieger   | 8 ms                       | 10 ms                        | 33 ms                          | 530 ms                         | 1619 ms                        |

*All failures due to invalid URL during benchmarking