import pathlib
import json
from flask import Flask


def create_app():
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    app_path = pathlib.Path(app.root_path)

    # Load the database config
    dbconfig_path = app_path / 'db-config.json'
    with open(dbconfig_path, 'r') as secret_file:
        db_config = json.load(secret_file)
        # TODO: MAKE SURE ALL VALUES HAVE BEEN SET

    # Add database config to the app config
    app.config.from_mapping(
        DB_HOST=db_config['host'],
        DB_USER=db_config['user'],
        DB_PASSWORD=db_config['password'],
        DB_NAME=db_config['database_name'],
    )

    # Ensure the instance folder exists
    instance_path = pathlib.Path(app.instance_path)
    instance_path.mkdir(exist_ok=True)

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    return app