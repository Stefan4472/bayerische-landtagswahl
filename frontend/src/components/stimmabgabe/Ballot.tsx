import React from "react";
import {Button, Card, Col, Container, Form, ListGroup, Row} from "react-bootstrap";
import {BallotCandidate, BallotInfo} from "../../rest_client/StimmabgabeEndpoints";
import {MAIN_PARTIES, MAIN_PARTY_ORDER, orderParties} from "../../PartyDisplay";
import {DirectCandidateSelector} from "./DirectCandidateSelector";
import {ListCandidateSelector} from "./ListCandidateSelector";

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
                            <DirectCandidateSelector
                                candidates={this.props.ballotInfo.direct_candidates}
                                onCandidateSelected={(candidate: BallotCandidate) => {
                                    this.handleDirectCandidateSelected(candidate)
                                }}
                                selectedCandidate={this.state.selectedDirectCandidate}
                            />
                        </Col>
                        <Col>
                            <h3>
                                Select a List Candidate
                            </h3>
                            <ListCandidateSelector
                                candidates={this.props.ballotInfo.list_candidates}
                                onCandidateSelected={(candidate: BallotCandidate) => {
                                    this.handleListCandidateSelected(candidate)
                                }}
                                selectedCandidate={this.state.selectedListCandidate}
                            />
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



