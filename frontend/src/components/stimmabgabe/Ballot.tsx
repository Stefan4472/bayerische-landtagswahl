import React from "react";
import {Button, Card, Col, Container, Form, ListGroup, Row} from "react-bootstrap";
import {BallotCandidate, BallotInfo} from "../../rest_client/StimmabgabeEndpoints";
import {MAIN_PARTIES, MAIN_PARTY_ORDER, orderParties} from "../../PartyDisplay";

interface Props {
    ballotInfo: BallotInfo,
    onVoted: (directCandidate?: BallotCandidate, listCandidate?: BallotCandidate) => void,
}

interface State {
    selectedDirectCandidate?: BallotCandidate,
    selectedListCandidate?: BallotCandidate,
}

export class Ballot extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    handleDirectCandidateSelected(candidate: BallotCandidate) {
        this.setState({
            selectedDirectCandidate: candidate,
        })
    }

    handleListCandidateSelected(candidate: BallotCandidate) {
        this.setState({
            selectedListCandidate: candidate,
        })
    }

    handleSubmit() {
        this.props.onVoted(
            this.state.selectedDirectCandidate,
            this.state.selectedListCandidate,
        );
    }

    // Sorts candidates. Main parties will appear first, in proper
    // order, with candidates sorted alphabetically by last name.
    // Then minor parties will appear in alphabetical order, with their
    // candidates also sorted alphabetically by last name.
    orderCandidates(candidates: BallotCandidate[]) {
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

    render() {
        return (
            <Card>
                <Card.Body>
                    <h3>({this.props.ballotInfo.stimmkreis_nr}) {this.props.ballotInfo.stimmkreis}</h3>
                    <Row>
                        <Col>
                            <h3>
                                Select a Direct Candidate
                            </h3>
                            {orderParties(this.props.ballotInfo.direct_candidates).map(candidate =>
                                <ListGroup.Item
                                    action
                                    active={candidate === this.state.selectedDirectCandidate}
                                    onClick={() => {
                                        this.handleDirectCandidateSelected(candidate)
                                    }}
                                    key={'direct-candidate-' + candidate.id}
                                >
                                    ({candidate.party_name}) {candidate.first_name} {candidate.last_name}
                                </ListGroup.Item>
                            )}
                        </Col>
                        <Col>
                            <h3>
                                Select a List Candidate
                            </h3>
                            {this.orderCandidates(this.props.ballotInfo.list_candidates).map(candidate =>
                                <ListGroup.Item
                                    action
                                    active={candidate === this.state.selectedListCandidate}
                                    onClick={() => {
                                        this.handleListCandidateSelected(candidate)
                                    }}
                                    key={'list-candidate-' + candidate.id}
                                >
                                    ({candidate.party_name}) {candidate.first_name} {candidate.last_name}
                                </ListGroup.Item>
                            )}
                        </Col>
                    </Row>
                    <div className="buttonBar clearfix">
                        <Button
                            className="button float-right"
                            id="submit-button"
                            variant="primary"
                            onClick={() => this.handleSubmit()}
                        >
                            Submit
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        )
    }
}



