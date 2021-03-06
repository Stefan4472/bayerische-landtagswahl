import React from "react";
import {Container, Form} from "react-bootstrap";
import {Ballot} from "./Ballot";
import StimmabgabeEndpoints, {BallotInfo, CompletedBallot} from "../../rest_client/StimmabgabeEndpoints";

interface Props {
}

interface State {
    voterKey: string,
    isKeyValid: boolean,
    isKeyInvalid: boolean,
    keyErrorMessage?: string,
    ballotInfo?: BallotInfo,
}

export class StimmabgabePage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            voterKey: '',
            isKeyValid: false,
            isKeyInvalid: false,
        };
    }

    validateKey(key: string) {
        if (key.length === 64) {
            StimmabgabeEndpoints.getWahlInfo(key).then((ballotInfo) => {
                this.setState({
                    voterKey: key,
                    isKeyValid: true,
                    isKeyInvalid: false,
                    keyErrorMessage: undefined,
                    ballotInfo: ballotInfo,
                })
            }).catch(() => {
                this.setState({
                    voterKey: key,
                    isKeyValid: false,
                    isKeyInvalid: true,
                    keyErrorMessage: 'Invalid Key',
                })
            })
        }
        else {
            this.setState({
                voterKey: key,
                isKeyValid: false,
                isKeyInvalid: true,
                keyErrorMessage: undefined,
            })
        }
    }

    submitVote(completedBallot: CompletedBallot) {
        StimmabgabeEndpoints.submitVote(
            this.state.voterKey,
            completedBallot,
        ).then(result => {
            if (result.success) {
                alert("Ihre Stimme würde erfolgreich gezählt");
                // Now clear the ballot and key
                this.setState({
                    voterKey: '',
                    isKeyValid: false,
                    isKeyInvalid: false,
                    ballotInfo: undefined,
                })
            }
            else {
                alert('Error: ' + result.message);
            }
        })
    }

    render() {
        return (
            <Container>
                <h3>Stimmabgabe</h3>
                <hr/>
                <Form>
                    <Form.Group controlId="form-voterKey">
                        <Form.Label>
                            Geben Sie Ihren 64-stelligen Stimm-Schlüssel ein
                        </Form.Label>
                        <Form.Control
                            required
                            placeholder="64-stelliger Schlüssel"
                            value={this.state.voterKey}
                            disabled={this.state.isKeyValid}
                            isValid={this.state.isKeyValid}
                            isInvalid={this.state.isKeyInvalid}
                            onChange={newValue => {
                                this.validateKey(newValue.target.value);
                            }}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.state.keyErrorMessage ? (
                                this.state.keyErrorMessage
                            ) : (
                                <span>Der Schlüssel muss 64 Zeichen lang sein (momentan {this.state.voterKey.length})</span>
                            )}
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type={"valid"}>
                            Wilkommen! Ihr Schlüssel würde erfolgreich gelesen
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
                {(this.state.isKeyValid && this.state.ballotInfo) && (
                    <Ballot
                        ballotInfo={this.state.ballotInfo}
                        onVoted={(completedBallot) =>
                            this.submitVote(completedBallot)
                        }
                    />
                )}
            </Container>
        )
    }
}



