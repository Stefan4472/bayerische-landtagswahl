import os
import pathlib
import json
from flask import Flask


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    instance_path = pathlib.Path(app.instance_path)

    # Create the instance folder if it doesn't already exist
    instance_path.mkdir(exist_ok=True)

    # Load the secret config
    dbconfig_path = instance_path / 'db-config.json'
    with open(dbconfig_path, 'r') as secret_file:
        db_config = json.load(secret_file)
        print(db_config)
        # TODO: MAKE SURE ALL VALUES HAVE BEEN SET

    # Add database config to the app config
    app.config.from_mapping(
        DB_HOST=db_config['host'],
        DB_USER=db_config['user'],
        DB_PASSWORD=db_config['password'],
        DB_NAME=db_config['database_name'],
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    return app