import React from "react";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import {BallotCandidate, BallotInfo} from "../../rest_client/StimmabgabeEndpoints";

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
                            {this.props.ballotInfo.direct_candidates.map(candidate =>
                                <Row>
                                    <label><input type="radio" name="direct" onClick={() => this.handleDirectCandidateSelected(candidate)}/>
                                        ({candidate.party_name}) {candidate.first_name} {candidate.last_name}
                                    </label>
                                </Row>
                            )}
                        </Col>
                        <Col>
                            <h3>
                                Select a List Candidate
                            </h3>
                            {this.props.ballotInfo.list_candidates.map(candidate =>
                                <Row>
                                    <label><input type="radio" name="list" onClick={() => this.handleListCandidateSelected(candidate)}/>
                                        ({candidate.party_name}) {candidate.first_name} {candidate.last_name}
                                    </label>
                                </Row>
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



