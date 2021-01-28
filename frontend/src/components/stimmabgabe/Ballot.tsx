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
    directFilterText: string;
    listFilterText: string;
    selectedDirectCandidate?: BallotCandidate,
    selectedListCandidate?: BallotCandidate,
}

export class Ballot extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            directFilterText: "",
            listFilterText: "",
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

    onDirectFilterChanged(filter: string) {
        this.setState({
            directFilterText: filter,
        })
    }

    onListFilterChanged(filter: string) {
        this.setState({
            listFilterText: filter,
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
                            <Form>
                                <Form.Control
                                    className={'mb-2'}
                                    type="text"
                                    placeholder="Search for Candidate or Party..."
                                    onChange={(event) => {
                                        this.onDirectFilterChanged(event.target.value);
                                    }}
                                />
                            </Form>
                            <div className={"overflow-auto"} style={{height: "500px"}}>
                                <DirectCandidateSelector
                                    candidates={this.props.ballotInfo.direct_candidates}
                                    onCandidateSelected={(candidate: BallotCandidate) => {
                                        this.handleDirectCandidateSelected(candidate)
                                    }}
                                    selectedCandidate={this.state.selectedDirectCandidate}
                                    filterText={this.state.directFilterText}
                                />
                            </div>
                        </Col>
                        <Col>
                            <h3>
                                Select a List Candidate
                            </h3>
                            <Form>
                                <Form.Control
                                    className={'mb-2'}
                                    type="text"
                                    placeholder="Search for Candidate or Party..."
                                    onChange={(event) => {
                                        this.onListFilterChanged(event.target.value);
                                    }}
                                />
                            </Form>
                            <div className={"overflow-auto"} style={{height: "500px"}}>
                                <ListCandidateSelector
                                    candidates={this.props.ballotInfo.list_candidates}
                                    onCandidateSelected={(candidate: BallotCandidate) => {
                                        this.handleListCandidateSelected(candidate)
                                    }}
                                    selectedCandidate={this.state.selectedListCandidate}
                                    filterText={this.state.listFilterText}
                                />
                            </div>
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