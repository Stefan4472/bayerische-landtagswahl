from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
import db_context


# Blueprint under which all API routes will be registered
API_BLUEPRINT = Blueprint('api', __name__, url_prefix='/api')


@API_BLUEPRINT.route('/')
def index():
    db = db_context.get_db()
    return 'Hello World'
