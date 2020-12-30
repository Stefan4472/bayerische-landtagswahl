from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify,
)
from werkzeug.exceptions import abort
import db_context


# Blueprint under which all API routes will be registered
API_BLUEPRINT = Blueprint('api', __name__, url_prefix='/api')

# NOTE: CURRENTLY HARDCODED TO WAHL_ID = 1
WAHL_ID = 1


# TODO: HOW TO IMPLEMENT THIS PROPERLY?
@API_BLUEPRINT.route('/main-parties/')
def get_main_parties():
    """Return list of parties in-order that they should be displayed,
    and with display color."""
    # Temporary CORS workaround: https://stackoverflow.com/a/33091782
    # Now using colors from the Material Design chart: https://htmlcolorcodes.com/color-chart/
    return jsonify([
        {'name': 'CSU', 'color': '#90caf9 '},
        {'name': 'SPD', 'color': '#ef5350 '},
        {'name': 'FREIE WÄHLER', 'color': '#ffb74d '},
        {'name': 'GRÜNE', 'color': '#66bb6a'},
        {'name': 'FDP', 'color': '#ffee58'},
        {'name': 'DIE LINKE', 'color': '#ab47bc'},
        {'name': 'AfD', 'color': '#5c6bc0'},
    ])


@API_BLUEPRINT.route('/stimmkreise')
def get_stimmkreise():
    db = db_context.get_db()
    return jsonify(db.get_stimmkreise(WAHL_ID))


# TODO: GENERALLY, NEED A TON OF LEGIBILITY IMPROVEMENTS, NAMED TUPLES, DTOS, ETC.
@API_BLUEPRINT.route('/results/stimmkreis/<number>')
def get_stimmkreis_overview(number: int):
    db = db_context.get_db()
    # Look up StimmkreisID
    stimmkreis_id = db.get_stimmkreis_id(WAHL_ID, number)
    # Perform queries
    turnout = db.get_stimmkreis_turnout(WAHL_ID, stimmkreis_id)
    erst_by_party = {
        rec.party_name: rec for rec in db.get_stimmkreis_erststimmen(WAHL_ID, stimmkreis_id)
    }
    gesamt_by_party = {
        rec.party_name: rec for rec in db.get_stimmkreis_gesamtstimmen(WAHL_ID, stimmkreis_id)
    }
    # Form response. The 'results' dictionary requires coalescing first-
    # and second-votes by party
    # TODO: SIMPLIFY
    return jsonify({
        'turnout_percent': turnout,
        'results': [
            {
                'party': party_name,
                'candidate': erst_by_party[party_name].candidate_fname + ', ' + erst_by_party[party_name].candidate_lname,
                'erststimmen': erst_by_party[party_name].num_erststimmen,
                'zweitstimmen': gesamt_by_party[party_name].num_gesamtstimmen - erst_by_party[party_name].num_erststimmen,
            } for party_name in erst_by_party.keys()
        ],
    })


@API_BLUEPRINT.route('/results/sitzverteilung')
def get_sitzverteilung():
    db = db_context.get_db()
    return jsonify({rec.party_name: rec.num_sitze for rec in db.get_sitz_verteilung(WAHL_ID)})


@API_BLUEPRINT.route('/results/elected-candidates')
def get_elected_candidates():
    db = db_context.get_db()
    return jsonify([
        {
            'fname': rec.first_name,
            'lname': rec.last_name,
            'party': rec.party_name,
            'wahlkreis': rec.wahlkreis_name,
        } for rec in db.get_elected_candidates(WAHL_ID)
    ])