import dataclasses
import enum


class Wahlkreis(enum.Enum):
    Oberbayern = 1
    Niederbayern = 2
    Oberpfalz = 3
    Oberfranken = 4
    Mittelfranken = 5
    Unterfranken = 6
    Schwaben = 7


def determine_wahlkreis(stimmkreis_nr: int) -> Wahlkreis:
    if stimmkreis_nr >= 100 and stimmkreis_nr < 200:
        return Wahlkreis.Oberbayern
    elif stimmkreis_nr >= 200 and stimmkreis_nr < 300:
        return Wahlkreis.Niederbayern
    elif stimmkreis_nr >= 300 and stimmkreis_nr < 400:
        return Wahlkreis.Oberpfalz
    elif stimmkreis_nr >= 400 and stimmkreis_nr < 500:
        return Wahlkreis.Oberfranken
    elif stimmkreis_nr >= 500 and stimmkreis_nr < 600:
        return Wahlkreis.Mittelfranken
    elif stimmkreis_nr >= 600 and stimmkreis_nr < 700:
        return Wahlkreis.Unterfranken
    elif stimmkreis_nr >= 700 and stimmkreis_nr < 800:
        return Wahlkreis.Schwaben
    else:
        raise ValueError('Invalid stimmkreis number')


@dataclasses.dataclass(eq=True, frozen=True)
class StimmKreis:
    name: str
    number: int
    num_eligible_voters: int
    num_who_voted: int

    def get_wahlkreis(self) -> Wahlkreis:
        return determine_wahlkreis(self.number)


@dataclasses.dataclass(eq=True, frozen=True)
class Candidate:
    first_name: str
    last_name: str
    party: str
    wahlkreis: Wahlkreis


@dataclasses.dataclass(eq=True, frozen=True)
class StimmkreisResult:
    stimmkreis_nr: int
    num_votes: int

    
@dataclasses.dataclass
class DirectResult:
    candidate: Candidate
    stimmkreis_id: int
    num_votes: int


@dataclasses.dataclass
class ListResults:
    candidate: Candidate
    results: list[StimmkreisResult] = dataclasses.field(default_factory=list)


class VoteType(enum.Enum):
    Erst = 1
    Zweit = 2


def get_vote_type(stimmentype: str) -> VoteType:
    if stimmentype == 'Zweitstimmen':
        return VoteType.Zweit
    elif stimmentype == 'Erststimmen':
        return VoteType.Erst
    else:
        raise ValueError('Unrecognized "stimmentype": {}'.format(stimmentype))
