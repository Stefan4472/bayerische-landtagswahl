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

    clearErstStimme() {
        this.setState({
            selectedDirectCandidate: undefined,
        })
    }

    clearZweitStimme() {
        this.setState({
            selectedParty: undefined,
            selectedListCandidate: undefined,
        })
    }

    handleSubmit() {
        let direct_confirm: string;
        if (this.state.selectedDirectCandidate) {
            direct_confirm = "Sie haben " + this.state.selectedDirectCandidate.first_name + " " + this.state.selectedDirectCandidate.last_name + " (" + this.state.selectedDirectCandidate.party_name + ") als Direkt-Kandidat gewählt"
        }
        else {
            direct_confirm = "Sie haben keine Auswahl für ErsteStimme gemacht"
        }

        let list_confirm: string;
        if (this.state.selectedListCandidate) {
            list_confirm = "Sie haben " + this.state.selectedListCandidate.first_name + " (" + this.state.selectedListCandidate.last_name + ") " + this.state.selectedListCandidate.party_name + " als List-Kandidat gewählt"
        }
        else if (this.state.selectedParty) {
            list_confirm = "Sie haben " + this.state.selectedParty.party_name + " als Zweitstimme Partei gewählt"
        }
        else {
            list_confirm = "Sie haben keine Auswahl für Zweitstimme gemacht"
        }

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
                    <h2>Stimmzetel: ({this.props.ballotInfo.stimmkreis_nr}) {this.props.ballotInfo.stimmkreis}</h2>
                    <hr/>
                    <Row>
                        <Col style={{"borderRight": "1px dashed #333"}}>
                            <h3>
                                Erste Stimme
                            </h3>
                            <Form>
                                <Form.Control
                                    className={'mb-2'}
                                    type="text"
                                    placeholder="Suche für Kandidat oder Partei..."
                                    onChange={(event) => {
                                        this.onDirectFilterChanged(event.target.value);
                                    }}
                                />
                            </Form>
                            <DirectCandidateSelector
                                candidates={this.props.ballotInfo.direct_candidates}
                                onCandidateSelected={(candidate: BallotCandidate) => {
                                    this.handleDirectCandidateSelected(candidate)
                                }}
                                selectedCandidate={this.state.selectedDirectCandidate}
                                filterText={this.state.directFilterText}
                            />
                        </Col>
                        <Col>
                            <h3>
                                Zweite Stimme
                            </h3>
                            <Form>
                                <Form.Control
                                    className={'mb-2'}
                                    type="text"
                                    placeholder="Suche für Kandidat oder Partei..."
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
                                Oder: Wähle eine Partei
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
                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col>
                            <h5>
                                {this.state.selectedDirectCandidate ? (
                                    <span>Erste Stimme: {this.state.selectedDirectCandidate.first_name} {this.state.selectedDirectCandidate.last_name}, {this.state.selectedDirectCandidate.party_name}</span>
                                ) : (
                                    <span>Erste Stimme noch nicht ausgewählt</span>
                                )}
                                <Button className="close" aria-label="Close" onClick={() => this.clearErstStimme()}>
                                    <span aria-hidden="true">&times;</span>
                                </Button>
                            </h5>
                        </Col>
                        <Col>
                            <h5>
                                {this.state.selectedListCandidate ? (
                                    <span>List-Kandidat: {this.state.selectedListCandidate.first_name} {this.state.selectedListCandidate.last_name}, {this.state.selectedListCandidate.party_name}</span>
                                ) : (
                                    <span>
                                        {this.state.selectedParty ? (
                                            <span>Partei-Stimme: {this.state.selectedParty.party_name}</span>
                                        ) : (
                                            <span>Zweite Stimme noch nicht ausgewählt</span>
                                        )}
                                    </span>
                                )}
                                <Button className="close" aria-label="Close" onClick={() => this.clearZweitStimme()}>
                                    <span aria-hidden="true">&times;</span>
                                </Button>
                            </h5>
                        </Col>
                    </Row>
                    <Row className={"mt-2 justify-content-center"}>
                        <Button
                            className="text-center"
                            id="submit-button"
                            variant="success"
                            size={"lg"}
                            onClick={() => this.handleSubmit()}
                        >
                            Stimmzetel Abgeben
                        </Button>

                    </Row>
                </Card.Body>
            </Card>
        )
    }
}