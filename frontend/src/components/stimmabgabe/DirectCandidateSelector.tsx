import React, {useEffect} from "react";
import {BallotCandidate} from "../../rest_client/StimmabgabeEndpoints";
import {orderParties} from "../../PartyDisplay";
import {ListGroup} from "react-bootstrap";

interface Props {
    candidates: BallotCandidate[];
    onCandidateSelected: (candidate: BallotCandidate) => void;
    selectedCandidate?: BallotCandidate;
    filterText?: string;
}

export const DirectCandidateSelector: React.FC<Props> = (props: Props) => {

    function processCandidates(candidates: BallotCandidate[], filterTerm: string|undefined) {
        if (filterTerm) {
            return performFilter(candidates, filterTerm);
        }
        else {
            return orderParties(candidates);
        }
    }

    function performFilter(candidates: BallotCandidate[], filterTerm: string|undefined) : BallotCandidate[] {
        if (!filterTerm || filterTerm === '') {
            return candidates;
        }

        let filter_lower = filterTerm.toLowerCase();
        return candidates.filter((candidate) =>
            candidate.first_name.toLowerCase().startsWith(filter_lower) ||
            candidate.last_name.toLowerCase().startsWith(filter_lower) ||
            candidate.party_name.toLowerCase().startsWith(filter_lower)
        )
    }

    return (
        <div>
            {processCandidates(props.candidates, props.filterText).map(candidate =>
                <ListGroup.Item
                    action
                    active={candidate === props.selectedCandidate}
                    onClick={() => {
                        props.onCandidateSelected(candidate)
                    }}
                    key={'direct-candidate-' + candidate.id}
                >
                    ({candidate.party_name}) {candidate.first_name} {candidate.last_name}
                </ListGroup.Item>
            )}
        </div>
    )
}