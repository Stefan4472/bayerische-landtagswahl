import React from "react";
import {Container, Form} from "react-bootstrap";
import {Ballot} from "./Ballot";
import StimmabgabeEndpoints, {BallotCandidate, BallotInfo} from "../../rest_client/StimmabgabeEndpoints";

interface Props {
}

interface State {
    voterKey: string,
    isKeyValid: boolean,
    isKeyInvalid: boolean,
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
        console.log(key.length);
        if (key.length === 64) {
            console.log('Valid!');
            let ballot_info = StimmabgabeEndpoints.getWahlInfo(key).then((ballotInfo) => {
                this.setState({
                    key: key,
                    isKeyValid: true,
                    isKeyInvalid: false,
                    ballotInfo: ballotInfo,
                })
            })

        }
        else {
            this.setState({
                key: key,
                isKeyValid: false,
                isKeyInvalid: true,
            })
        }
    }

    submitVote(directCandidate?: BallotCandidate, listCandidate?: BallotCandidate) {
        console.log('Submitting vote...', directCandidate, listCandidate);
        StimmabgabeEndpoints.submitVote(
            this.state.voterKey,
            directCandidate,
            listCandidate,
        ).then(result => {
            if (result.success) {
                alert('You have successfully voted');
            }
            else {
                alert('Error: ' + result.message);
            }
        })
    }

    render() {
        return (
            <Container>
                <Form>
                    <Form.Group controlId="form-voterKey">
                        <Form.Label>
                            Enter Your Voter Key
                        </Form.Label>
                        <Form.Control
                            required
                            placeholder="64-character key"
                            disabled={this.state.isKeyValid}
                            isValid={this.state.isKeyValid}
                            isInvalid={this.state.isKeyInvalid}
                            onChange={newValue => {
                                this.validateKey(newValue.target.value);
                            }}
                        />
                        <Form.Control.Feedback type="invalid">
                            Key must be 64 characters long (currently {this.state.voterKey.length})
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
                {(this.state.isKeyValid && this.state.ballotInfo) && (
                    <Ballot
                        ballotInfo={this.state.ballotInfo}
                        onVoted={(directCandidate?: BallotCandidate, listCandidate?: BallotCandidate) =>
                            this.submitVote(directCandidate, listCandidate)
                        }
                    />
                )}
            </Container>
        )
    }
}



