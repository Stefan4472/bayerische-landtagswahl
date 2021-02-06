import React from "react";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {BallotCandidate, BallotInfo, BallotParty, CompletedBallot} from "../../rest_client/StimmabgabeEndpoints";
import {DirectCandidateSelector} from "./DirectCandidateSelector";
import {ListCandidateSelector} from "./ListCandidateSelector";
import {PartySelector} from "./PartySelector";

interface Props {
    ballotInfo: BallotInfo,
    onVoted: (ballot: CompletedBallot) => void,
}

interface State {
    directFilterText: string;
    listFilterText: string;
    selectedDirectCandidate?: BallotCandidate,
    selectedListCandidate?: BallotCandidate,
    selectedParty?: BallotParty,
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
            selectedParty: undefined,
        })
    }

    handlePartySelected(party: BallotParty) {
        this.setState({
            selectedParty: party,
            selectedListCandidate: undefined,
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
        let direct_confirm = this.state.selectedDirectCandidate ? (
            "Sie haben " + this.state.selectedDirectCandidate.first_name + " " + this.state.selectedDirectCandidate.last_name + " " + this.state.selectedDirectCandidate.party_name + " als Direkt-Kandidat gewählt"
        ) : (
            "Sie haben kein Direkt-Kandidaten gewählt"
        )
        let list_confirm = this.state.selectedListCandidate ? (
            "Sie haben " + this.state.selectedListCandidate.first_name + " " + this.state.selectedListCandidate.last_name + " " + this.state.selectedListCandidate.party_name + " als List-Kandidat gewählt"
        ) : (
            "Sie haben kein List-Kandidaten gewählt"
        )

        let is_confirmed = window.confirm(
            direct_confirm + "\n" + list_confirm + "\nKlicken Sie \"OK\" um ihre Stimme abzugeben, oder \"Cancel\" um mehr Änderungen zu machen. Sobald Sie abgeben, können Sie keine Änderungen mehr machen"
        );

        if (is_confirmed) {
            this.props.onVoted({
                directCandidate: this.state.selectedDirectCandidate,
                listCandidate: this.state.selectedListCandidate,
                listParty: this.state.selectedParty,
            });
        }
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
                            <div className={"overflow-auto"} style={{height: "800px"}}>
                                <DirectCandidateSelector
                                    candidates={this.props.ballotInfo.direct_candidates}
                                    onCandidateSelected={(candidate: BallotCandidate) => {
                                        this.handleDirectCandidateSelected(candidate)
                                    }}
                                    selectedCandidate={this.state.selectedDirectCandidate}
                                    filterText={this.state.directFilterText}
                                />
                            </div>
                            <h5>
                                {this.state.selectedDirectCandidate ? (
                                    <span>Direkt-Kandidat: {this.state.selectedDirectCandidate.first_name} {this.state.selectedDirectCandidate.last_name}, {this.state.selectedDirectCandidate.party_name}</span>
                                ) : (
                                    <span>Kein Direkt-Kandidat gewählt</span>
                                )}
                            </h5>
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
                            <div className={"overflow-auto"} style={{height: "400px"}}>
                                <ListCandidateSelector
                                    candidates={this.props.ballotInfo.list_candidates}
                                    onCandidateSelected={(candidate: BallotCandidate) => {
                                        this.handleListCandidateSelected(candidate)
                                    }}
                                    selectedCandidate={this.state.selectedListCandidate}
                                    filterText={this.state.listFilterText}
                                />
                            </div>
                            <h4 className={"text-center"}>
                                Oder: Partei Stimme
                            </h4>
                            <div className={"overflow-auto"} style={{height: "300px"}}>
                                <PartySelector
                                    parties={this.props.ballotInfo.parties}
                                    onPartySelected={(party: BallotParty) => {
                                        this.handlePartySelected(party);
                                    }}
                                    selectedParty={this.state.selectedParty}
                                />
                            </div>
                            <h5>
                                {this.state.selectedListCandidate ? (
                                    <span>List-Kandidat: {this.state.selectedListCandidate.first_name} {this.state.selectedListCandidate.last_name}, {this.state.selectedListCandidate.party_name}</span>
                                ) : (
                                    <span>Kein List-Kandidat gewählt</span>
                                )}
                            </h5>
                        </Col>
                    </Row>
                    <div className="buttonBar clearfix">
                        <Button
                            className="button float-right"
                            id="submit-button"
                            variant="success"
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