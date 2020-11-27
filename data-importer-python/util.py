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


@dataclasses.dataclass
class DirectResult:
    candidate: Candidate
    region_key: int
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