from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify,
)
from flask_cors import cross_origin
from werkzeug.exceptions import abort
import db_context


# Blueprint under which all API routes will be registered
API_BLUEPRINT = Blueprint('api', __name__, url_prefix='/api')

# NOTE: CURRENTLY HARDCODED TO WAHL_ID = 1
WAHL_ID = 1

@API_BLUEPRINT.route('/')
# @cross_origin
def index():
    # Temporary CORS workaround: https: // stackoverflow.com / a / 33091782
    response = jsonify({'some': 'data'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@API_BLUEPRINT.route('/stimmkreise')
def get_stimmkreise():
    db = db_context.get_db()
    stimmkreis_info = db.get_stimmkreise(WAHL_ID)
    # Construct json
    # TODO: DO THIS PROPERLY WITH DATA TRANSFER OBJECTS (/PYTHON-EQUIVALENT)
    stimmkreis_json = [
        {
            'id': info[0],
            'name': info[1],
            'number': info[3],
        } for info in stimmkreis_info
    ]
    # Temporary CORS workaround: https: // stackoverflow.com / a / 33091782
    response = jsonify(stimmkreis_json)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
