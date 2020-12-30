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


@API_BLUEPRINT.route('/results/stimmkreis/<int:stimmkreis_nr>')
def get_stimmkreis_overview(stimmkreis_nr: int):
    db = db_context.get_db()
    # Look up StimmkreisID
    stimmkreis_id = db.get_stimmkreis_id(WAHL_ID, stimmkreis_nr)
    # Perform queries
    turnout_pct = db.get_stimmkreis_turnout(WAHL_ID, stimmkreis_id)
    erst_by_party = {
        rec.party_name: rec for rec in db.get_stimmkreis_erststimmen(WAHL_ID, stimmkreis_id)
    }
    gesamt_by_party = {
        rec.party_name: rec for rec in db.get_stimmkreis_gesamtstimmen(WAHL_ID, stimmkreis_id)
    }
    # Form response. The 'results' dictionary requires coalescing first-
    # and second-votes by party
    return jsonify({
        'turnout_percent': turnout_pct,
        'results': [
            {
                'party_name': party_name,
                'candidate_fname': erst_by_party[party_name].candidate_fname,
                'candidate_lname': erst_by_party[party_name].candidate_lname,
                'erst_stimmen': erst_by_party[party_name].num_erststimmen,
                'gesamt_stimmen': gesamt_by_party[party_name].num_gesamtstimmen,
            } for party_name in erst_by_party.keys()
        ],
    })


@API_BLUEPRINT.route('/results/sitzverteilung')
def get_sitzverteilung():
    db = db_context.get_db()
    return jsonify(db.get_sitz_verteilung(WAHL_ID))


@API_BLUEPRINT.route('/results/mitglieder')
def get_mitglieder():
    db = db_context.get_db()
    return jsonify(db.get_mitglieder(WAHL_ID))