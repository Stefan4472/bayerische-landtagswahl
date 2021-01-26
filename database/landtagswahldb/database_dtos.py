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


@dc.dataclass
class Ueberhangmandat:
    party_name: str
    wahlkreis_name: str
    num_mandates: int


@dc.dataclass
class StimmkreisSieger:
    stimmkreis_name: str
    stimmkreis_num: int
    party_name: str
    num_erststimmen: int
    num_zweitstimmen: int


@dc.dataclass
class KnappsteSieger:
    stimmkreis_name: str
    stimmkreis_num: int
    party_name: str
    candidate_fname: str
    candidate_lname: str
    win_margin: int


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


# @dc.dataclass
# class BallotInfo:
#     stimmkreis: str
#     stimmkreis_nr: int
#     direct_candidates: list[BallotKandidat]
#     list_candidates: list[BallotKandidat]
