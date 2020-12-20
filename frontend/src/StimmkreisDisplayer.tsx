import {Card, Col, Row} from "react-bootstrap";
import {StimmkreisInfo, StimmkreisSelector} from "./StimmkreisSelector";
import React from "react";
import {StimmkreisTable} from "./StimmkreisTable";


interface StimmkreisResult {
    party: string;
    candidate: string;
    erststimmen: number;
    zweitstimmen: number;
}

export interface Stimmkreis {
    id: number;
    name: string;
    number: number;
    turnout_percent: number;
    results: StimmkreisResult[];
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
        // TODO: BETTER FORMATTING OF URLS
        fetch('/api/results/stimmkreis/' + stimmkreisInfo.number.toString())
            .then(response => response.json())
            .then(data => {
                this.setState({
                    currStimmkreis: {
                        'id': stimmkreisInfo.id,
                        'name': stimmkreisInfo.name,
                        'number': stimmkreisInfo.number,
                        'turnout_percent': data.turnout_percent,
                        'results': data.results,
                    }
                })
            });
    }

    render() {
        // TODO: HOW TO SET ROW HEIGHT CORRECTLY?
        return <Row>
            {/*Provide Stimmkreis selector on left side*/}
            <Col md={4}>
                <div className={"overflow-auto"} style={{height: "500px"}}>
                    <StimmkreisSelector onSelect={(stkInfo) => this.onStimmkreisRequested(stkInfo)}/>
                </div>
            </Col>
            {/*Show results using the rest of the screen width*/}
            <Col>
                <Card>
                    <StimmkreisTable stimmkreis={this.state.currStimmkreis}/>
                </Card>
            </Col>
        </Row>
    }
}



