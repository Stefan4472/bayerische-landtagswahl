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


# TODO: HOW TO IMPLEMENT THIS PROPERLY?
@API_BLUEPRINT.route('/main-parties/')
def get_main_parties():
    """Return list of parties in-order that they should be displayed,
    and with display color."""
    # Temporary CORS workaround: https: // stackoverflow.com / a / 33091782
    response = jsonify([
        {'name': 'CSU', 'color': '#009FE3'},
        {'name': 'SPD', 'color': '#E20612'},
        {'name': 'FREIE WÄHLER', 'color': '#F29200'},
        {'name': 'GRÜNE', 'color': '#23A538'},
        {'name': 'FDP', 'color': '#FEED01'},
        {'name': 'DIE LINKE', 'color': '#AE1871'},
        {'name': 'AfD', 'color': '#006691'},
    ])
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


# TODO: GENERALLY, NEED A TON OF LEGIBILITY IMPROVEMENTS, NAMED TUPLES, DTOS, ETC.
@API_BLUEPRINT.route('/results/stimmkreis/<number>')
def get_stimmkreis_overview(number: int):
    db = db_context.get_db()
    # Look up StimmkreisID
    stimmkreis_id = db.get_stimmkreis_id(WAHL_ID, number)
    # Perform queries
    turnout = db.get_stimmkreis_turnout(WAHL_ID, stimmkreis_id)
    # winner_fname, winner_lname = db.get_stimmkreis_winner(WAHL_ID, stimmkreis_id)
    erst_by_party = db.get_stimmkreis_erststimmen(WAHL_ID, stimmkreis_id)
    gesamt_by_party = db.get_stimmkreis_gesamtstimmen(WAHL_ID, stimmkreis_id)
    # Form the 'results' dictionary, which requires coalescing first-
    # and second-votes by party
    results = [
        {
            'party': party_name,
            'candidate': erst_by_party[party_name][1] + ', ' + erst_by_party[party_name][0],
            'erststimmen': erst_by_party[party_name][2],
            'zweitstimmen': gesamt_by_party[party_name] - erst_by_party[party_name][2],
        } for party_name in erst_by_party.keys()
    ]
    # Form the response
    response = jsonify({
        'turnout_percent': turnout,
        'results': results,
    })
    # Temporary CORS workaround: https: // stackoverflow.com / a / 33091782
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
