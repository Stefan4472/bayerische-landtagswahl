import React from "react";
import {Button, Container, Form} from "react-bootstrap";
import {BallotInfo} from "../../rest_client/StimmabgabeEndpoints";

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
            <Form noValidate validated={this.state.isValidated} onSubmit={this.handleSubmit}>
                <Form.Group controlId="form-direktChoice">
                    <Form.Label>
                        Select a Direct Candidate
                    </Form.Label>
                    <div className={"radio"}>

                        <label><input type="radio" name="optradio" checked/> Option 1</label><br/>
                        <label><input type="radio" name="optradio" checked/> Option 1</label><br/>
                        <label><input type="radio" name="optradio" checked/> Option 1</label><br/>
                        <label><input type="radio" name="optradio" checked/> Option 1</label><br/>
                        <label><input type="radio" name="optradio" checked/> Option 1</label><br/>
                        <label><input type="radio" name="optradio" checked/> Option 1</label><br/>

                    </div>

                    {/*<Form.Control*/}
                    {/*    required*/}
                    {/*    placeholder="64-character key"*/}
                    {/*    disabled={this.state.isKeyValid}*/}
                    {/*    isValid={this.state.isKeyValid}*/}
                    {/*    isInvalid={this.state.isKeyInvalid}*/}
                    {/*    onChange={newValue => {*/}
                    {/*        this.validateKey(newValue.target.value);*/}
                    {/*    }}*/}
                    {/*/>*/}
                    {/*<Form.Control.Feedback type="invalid">*/}
                    {/*    Key must be 64 characters long (currently {this.state.key.length})*/}
                    {/*</Form.Control.Feedback>*/}
                </Form.Group>
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
            </Form>
        )
    }
}



