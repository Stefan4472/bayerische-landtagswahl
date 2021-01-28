from flask import current_app, g
from landtagswahldb import database as db
# Provides functions for accessing and later closing the database
# during a web request


def get_db():
    """Get this request's database connection."""
    # If the request doesn't have a database connection, then create one
    if 'db' not in g:
        g.db = db.Database(
            current_app.config['DB_HOST'],
            current_app.config['DB_USER'],
            current_app.config['DB_PASSWORD'],
            current_app.config['DB_NAME'],
            current_app.config['SECRET_KEY'],
        )
    return g.db


def close_db(e=None):
    """Close database connection and remove from request"""
    database = g.pop('db', None)
    # Close database connection
    if database is not None:
        database.close()
