import React from "react";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import {BallotCandidate, BallotInfo} from "../../rest_client/StimmabgabeEndpoints";

interface Props {
    ballotInfo: BallotInfo,
}

interface State {
    isValidated: boolean,
}

export class Ballot extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            isValidated: false,
        };
    }

    handleDirectCandidateSelected(candidate: BallotCandidate) {
        console.log("Selected direct candidate ", candidate);
    }

    handleListCandidateSelected(candidate: BallotCandidate) {
        console.log("Selected list candidate ", candidate);
    }

    handleSubmit(event: any) {
        const form = event.currentTarget;

        if (form.checkValidity()) {
            if (event.nativeEvent.submitter.id === "submit-button") {
            //    TODO: ONSUBMIT()
                console.log('Submitted');
            }
        }
        else {
            event.stopPropagation();
        }
        event.preventDefault();
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
                            type="submit"
                        >
                            Submit
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        )
    }
}



