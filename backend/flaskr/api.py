from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify,
)
from werkzeug.exceptions import abort, NotFound
import db_context


# Blueprint under which all API routes will be registered
API_BLUEPRINT = Blueprint('api', __name__, url_prefix='/api')


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


@API_BLUEPRINT.route('/wahl-jahre')
def get_wahljahre():
    """Return list of all election years in the database."""
    db = db_context.get_db()
    return jsonify(db.get_wahl_jahre())


@API_BLUEPRINT.route('/<int:year>/stimmkreise')
def get_stimmkreise(year: int):
    db = db_context.get_db()
    try:
        wahl_id = db.get_wahl_id(year)
        return jsonify(db.get_stimmkreise(wahl_id))
    except ValueError as e:
        raise NotFound(description=e.args[0])


@API_BLUEPRINT.route('/results/<int:year>/stimmkreis/<int:stimmkreis_nr>')
def get_stimmkreis_overview(year: int, stimmkreis_nr: int):
    db = db_context.get_db()
    try:
        wahl_id = db.get_wahl_id(year)
        # Look up StimmkreisID
        stimmkreis_id = db.get_stimmkreis_id(wahl_id, stimmkreis_nr)
        db.get_stimmkreis_winner(wahl_id, stimmkreis_id)
        # Perform queries
        turnout_pct = db.get_stimmkreis_turnout(wahl_id, stimmkreis_id)
        erst_by_party = {
            rec.party_name: rec for rec in db.get_stimmkreis_erststimmen(wahl_id, stimmkreis_id)
        }
        gesamt_by_party = {
            rec.party_name: rec for rec in db.get_stimmkreis_gesamtstimmen(wahl_id, stimmkreis_id)
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
    except ValueError as e:
        raise NotFound(description=e.args[0])


@API_BLUEPRINT.route('/results/<int:year>/sitzverteilung')
def get_sitzverteilung(year: int):
    db = db_context.get_db()
    try:
        wahl_id = db.get_wahl_id(year)
        return jsonify(db.get_sitz_verteilung(wahl_id))
    except ValueError as e:
        raise NotFound(description=e.args[0])


@API_BLUEPRINT.route('/results/<int:year>/mitglieder')
def get_mitglieder(year: int):
    db = db_context.get_db()
    try:
        wahl_id = db.get_wahl_id(year)
        return jsonify(db.get_mitglieder(wahl_id))
    except ValueError as e:
        raise NotFound(description=e.args[0])
