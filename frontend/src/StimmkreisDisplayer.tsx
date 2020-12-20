import {Card, Col, Row} from "react-bootstrap";
import {StimmkreisInfo, StimmkreisSelector} from "./StimmkreisSelector";
import React from "react";

interface Stimmkreis {
    id: number;
    name: string;
    number: number;
}

interface Props {

}

interface State {
    currStimmkreis?: Stimmkreis,
}

export class StimmkreisDisplayer extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    // Handle user requesting the overview of the specified Stimmkreis
    onStimmkreisRequested(stimmkreisInfo: StimmkreisInfo) {
        console.log(stimmkreisInfo);

        this.setState({
            currStimmkreis: stimmkreisInfo,
        });
    }

    render() {
      // TODO: HOW TO SET ROW HEIGHT CORRECTLY?
      return <Row>
            <Col md={4}>
                <div className={"overflow-auto"} style={{height: "500px"}}>
                    <StimmkreisSelector onSelect={this.onStimmkreisRequested}/>
                </div>
            </Col>
            <Col>
                <Card>

                </Card>
            </Col>
        </Row>
    }
}



