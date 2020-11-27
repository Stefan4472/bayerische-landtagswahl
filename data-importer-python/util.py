import dataclasses
import enum


@dataclasses.dataclass(eq=True, frozen=True)
class StimmKreis:
    region_id: int
    num_eligible_voters: int
    num_who_voted: int


@dataclasses.dataclass(eq=True, frozen=True)
class Candidate:
    first_name: str
    last_name: str
    party: str
    wahlkreis: str


@dataclasses.dataclass
class DirectResult:
    candidate: Candidate
    stimmkreis_id: int
    num_votes: int


@dataclasses.dataclass
class ListResults:
    candidate: Candidate
    # Results: a tuple of (region_key, num_votes)
    results: list[tuple[int, int]] = dataclasses.field(default_factory=list)


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


def determine_wahlkreis(stimmkreis_nr: int) -> str:
    if stimmkreis_nr >= 100 and stimmkreis_nr < 200:
        return 'Oberbayern'
    elif stimmkreis_nr >= 200 and stimmkreis_nr < 300:
        return 'Niederbayern'
    elif stimmkreis_nr >= 300 and stimmkreis_nr < 400:
        return 'Oberpfalz'
    elif stimmkreis_nr >= 400 and stimmkreis_nr < 500:
        return 'Oberfranken'
    elif stimmkreis_nr >= 500 and stimmkreis_nr < 600:
        return 'Mittelfranken'
    elif stimmkreis_nr >= 600 and stimmkreis_nr < 700:
        return 'Unterfranken'
    elif stimmkreis_nr >= 700 and stimmkreis_nr < 800:
        return 'Schwaben'
    else:
        raise ValueError('Invalid stimmkreis number')