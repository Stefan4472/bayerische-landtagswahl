import React from "react";
import {Container, Form} from "react-bootstrap";

interface Props {
}

interface State {
    key: string,
    validated: boolean,
    isKeyValid: boolean,
    isKeyInvalid: boolean,
}

export class StimmabgabePage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            key: '',
            validated: false,
            isKeyValid: false,
            isKeyInvalid: false,
        };
    }

    validateKey(key: string) {
        console.log(key.length);
        if (key.length === 64) {
            console.log('Valid!');
            this.setState({
                key: key,
                validated: true,
                isKeyValid: true,
                isKeyInvalid: false,
            })
        }
        else {
            this.setState({
                validated: false,
                isKeyValid: false,
                isKeyInvalid: true,
            })
        }
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
                            Key must be 64 characters long
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Container>
        )
    }
}



