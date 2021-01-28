import React from "react";
import {BallotCandidate} from "../../rest_client/StimmabgabeEndpoints";
import {orderParties} from "../../PartyDisplay";
import {ListGroup} from "react-bootstrap";

interface Props {
    candidates: BallotCandidate[];
    onCandidateSelected: (candidate: BallotCandidate) => void;
    selectedCandidate?: BallotCandidate;
}

export const DirectCandidateSelector: React.FC<Props> = (props: Props) => {

    return (
        <div>
            {orderParties(props.candidates).map(candidate =>
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