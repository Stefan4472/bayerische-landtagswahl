import pathlib
import json
from flask import Flask, send_from_directory
from landtagswahldb.database import PooledDatabaseConnection
from . import db_context
from . import api


def create_app():
    """Create and configure the Flask app."""
    app = Flask(
        __name__,
        instance_relative_config=True,
        static_url_path='',
    )

    # Ensure the instance folder exists
    instance_path = pathlib.Path(app.instance_path)
    instance_path.mkdir(exist_ok=True)

    # Load the database config
    dbconfig_path = instance_path / 'db-config.json'
    with open(dbconfig_path, 'r') as secret_file:
        db_config = json.load(secret_file)
        # TODO: MAKE SURE ALL VALUES HAVE BEEN SET

    # Add database config to the app config
    # TODO: ALLOW SPECIFYING SECRET_KEY IN A FILE?
    app.config.from_mapping(
        DB_HOST=db_config['host'],
        DB_USER=db_config['user'],
        DB_PASSWORD=db_config['password'],
        DB_NAME=db_config['database_name'],
        DB_POOL=PooledDatabaseConnection(
            db_config['host'],
            db_config['user'],
            db_config['password'],
            db_config['database_name'],
            'dev',
        ),
        SECRET_KEY='dev',
    )

    # Register the API blueprint
    app.register_blueprint(api.API_BLUEPRINT)

    # Register `close_db` as a teardown function
    app.teardown_appcontext(db_context.close_db)

    return app
