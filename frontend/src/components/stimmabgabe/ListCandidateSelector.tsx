import React from "react";
import {BallotCandidate} from "../../rest_client/StimmabgabeEndpoints";
import {MAIN_PARTIES, MAIN_PARTY_ORDER} from "../util/PartyDisplay";
import {ListGroup} from "react-bootstrap";

interface Props {
    candidates: BallotCandidate[];
    onCandidateSelected: (candidate: BallotCandidate) => void;
    selectedCandidate?: BallotCandidate;
    filterText?: string;
}

export const ListCandidateSelector: React.FC<Props> = (props: Props) => {

    function processCandidates(candidates: BallotCandidate[], filterTerm: string|undefined) {
        if (filterTerm) {
            return performFilter(candidates, filterTerm);
        }
        else {
            return orderCandidates(candidates);
        }
    }

    // TODO: THIS IS DUPLICATED CODE. MOVE TO A 'UTIL' FILE
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

    // Sorts candidates. Main parties will appear first, in proper
    // order, with candidates sorted alphabetically by last name.
    // Then minor parties will appear in alphabetical order, with their
    // candidates also sorted alphabetically by last name.
    function orderCandidates(candidates: BallotCandidate[]) {
        candidates.sort((a, b) => {
            let is_a_main = MAIN_PARTIES.has(a.party_name);
            let is_b_main = MAIN_PARTIES.has(b.party_name);

            // Sort alphabetically within own party
            if (a.party_name === b.party_name) {
                return a.last_name.localeCompare(b.last_name);
            }

            // Always put main parties ahead of minor parties
            if (is_a_main && !is_b_main) {
                return -1;
            }
            else if (!is_a_main && is_b_main) {
                return 1;
            }
            // Sort by order within main parties
            else if (is_a_main && is_b_main) {
                // @ts-ignore
                return MAIN_PARTY_ORDER.get(a.party_name) > MAIN_PARTY_ORDER.get(b.party_name) ? 1 : -1;
            }
            // Sort alphabetically within minor parties
            else {
                return a.party_name.localeCompare(b.party_name);
            }
        })
        return candidates;
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
                    key={'list-candidate-' + candidate.id}
                >
                    ({candidate.party_name}) {candidate.first_name} {candidate.last_name}
                </ListGroup.Item>
            )}
        </div>
    )
}