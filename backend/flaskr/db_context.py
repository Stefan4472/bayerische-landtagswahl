import psycopg2 as psy
from flask import current_app, g
import database as db
# Provides functions for accessing and later closing the database
# during a web request


def get_db():
    """Get this request's database connection."""
    # If the request doesn't have a database connection, then create one
    if 'db' not in g:
        g.db = db.Database(
            current_app.config['DB_HOST'],
            user=current_app.config['DB_USER'],
            password=current_app.config['DB_PASSWORD'],
            database_name=current_app.config['DB_NAME'],
        )
        #     psy.connect(
        #     host=current_app.config['DB_HOST'],
        #     dbname=current_app.config['DB_NAME'],
        #     user=current_app.config['DB_USER'],
        #     password=current_app.config['DB_PASSWORD'],
        # )
        print('Connected')

    return g.db


def close_db(e=None):
    # Remove database connection from request
    db = g.pop('db', None)

    # Close database connection
    if db is not None:
        db.close()
