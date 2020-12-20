The backend runs using a Python Flask webserver.

# Initial Setup

Edit `db-config.json` and insert the values you need to connect to your database. Do not commit `db-config.json`!

# Running the server

Instructions from [the Flask Tutorial](https://flask.palletsprojects.com/en/1.1.x/tutorial/factory/#run-the-application):

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