import dataclasses as dc
"""
Defines the database "Data Transfer Objects".
Essentially a bunch of utility dataclasses defining return
types of `database.py`.
"""


@dc.dataclass
class StimmkreisInfo:
    id: int
    name: str
    number: int


@dc.dataclass
class StimmkreisWinner:
    first_name: str
    last_name: str
    party_name: str


@dc.dataclass
class StimmkreisErststimmen:
    party_name: str
    candidate_fname: str
    candidate_lname: str
    num_erststimmen: int


@dc.dataclass
class StimmkreisGesamtstimmen:
    party_name: str
    num_gesamtstimmen: int
    percent: float
    # pct_change: float TODO


@dc.dataclass
class Sitzverteilung:
    party_name: str
    num_seats: int


@dc.dataclass
class Mitglied:
    first_name: str
    last_name: str
    party_name: str
    wahlkreis_name: str
    is_direct_candidate: bool
    stimmkreis_num: int
    stimmkreis_name: str


@dc.dataclass
class Ueberhangmandat:
    party_name: str
    wahlkreis_name: str
    sitze: int
    ueberhangmandate: int
    ausgleichsmandate: int


@dc.dataclass
class StimmkreisSieger:
    wahlkreis: str
    stimmkreis_name: str
    stimmkreis_num: int
    party_name: str
    num_erststimmen: int
    num_zweitstimmen: int
    percent: float


@dc.dataclass
class KnappsteSieger:
    stimmkreis_name: str
    stimmkreis_num: int
    party_name: str
    candidate_fname: str
    candidate_lname: str
    win_margin: int


@dc.dataclass
class KnappsteVerlierer:
    stimmkreis_name: str
    stimmkreis_num: int
    party_name: str
    candidate_fname: str
    candidate_lname: str
    lose_margin: int


@dc.dataclass
class PartyBestStimmkreis:
    party_name: str
    stimmkreis_name: str
    stimmkreis_num: int
    num_gesamtstimmen: int
    pct_gesamtstimmen: float


@dc.dataclass
class StimmkreisSwing:
    stimmkreis_name: str
    stimmkreis_num: int
    pct_change_left: float
    pct_change_right: float


@dc.dataclass
class VoterInfo:
    wahl_id: int
    stimmkreis_id: int
    has_voted: bool


@dc.dataclass
class BallotKandidat:
    id: int
    party_name: str
    first_name: str
    last_name: str
