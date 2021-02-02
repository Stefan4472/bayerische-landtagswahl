import {Card, Col, Container, Form, Row} from "react-bootstrap";
import {StimmkreisSelector} from "./StimmkreisSelector";
import React from "react";
import {StimmkreisTable} from "./StimmkreisTable";
import {StimmkreisChart} from "./StimmkreisChart";
import StimmkreisEndpoints, {Stimmkreis, StimmkreisInfo} from "../../rest_client/StimmkreisEndpoints";
import {orderParties} from "../../PartyDisplay";


interface Props {
    selectedYear: number,
}

interface State {
    currStimmkreis?: Stimmkreis,
    filterText: string,
}

// TODO: THIS NEEDS BETTER HANDLING OF CHANGED YEAR
export class StimmkreisPage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            filterText: "",
        };
    }

    // Handle user changing the filter text
    onFilterChanged(newFilter: string) {
        this.setState({
            filterText: newFilter,
        });
    }

    // Handle user requesting the overview of the specified Stimmkreis
    // TODO: HOW TO GET THIS TO UPDATE IF SELECTEDYEAR IS CHANGED?
    onStimmkreisRequested(stimmkreisInfo: StimmkreisInfo) {
        if (this.state.currStimmkreis && stimmkreisInfo.id === this.state.currStimmkreis.id) {
            return;
        }
        StimmkreisEndpoints.getResults(this.props.selectedYear, stimmkreisInfo.number).then(data => {
            this.setState({
                currStimmkreis: {
                    'id': stimmkreisInfo.id,
                    'name': stimmkreisInfo.name,
                    'number': stimmkreisInfo.number,
                    'turnout_percent': data.turnout_percent,
                    'results': orderParties(data.results),
                }
            })
        });
    }

    render() {
        // TODO: HOW TO SET ROW HEIGHT CORRECTLY?
        return (
            <Container>
                <Row className={"mb-2"}>
                    {/*Provide Stimmkreis selector on left side*/}
                    <Col md={4}>
                        {/*Search form*/}
                        <Form>
                            <Form.Label>Stimmkreis Auswahl</Form.Label>
                            <Form.Control
                                className={'mb-2'}
                                type="text"
                                placeholder="Enter Filter Here..."
                                onChange={(event) => {this.onFilterChanged(event.target.value);}}
                            />
                        </Form>
                        <div className={"overflow-auto"} style={{height: "420px"}}>
                            <StimmkreisSelector
                                selectedYear={this.props.selectedYear}
                                filterText={this.state.filterText}
                                onSelect={(stkInfo) => {
                                    return this.onStimmkreisRequested(stkInfo);
                                }}
                            />
                        </div>
                    </Col>
                    {/*Show results using the rest of the screen width*/}
                    <Col>
                        <Card>
                            <div className={"m-3"}>
                                <Card.Title>
                                    {this.state.currStimmkreis && (
                                        <span>({this.state.currStimmkreis?.number}) {this.state.currStimmkreis?.name}</span>
                                    )}
                                </Card.Title>
                                <StimmkreisChart
                                    stimmkreis={this.state.currStimmkreis}
                                />
                                <div className={"float-right"}>
                                    {this.state.currStimmkreis && (
                                        <span>Wahlbeteiligung: {this.state.currStimmkreis?.turnout_percent.toFixed(2)}%</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <StimmkreisTable
                    stimmkreis={this.state.currStimmkreis}
                />
            </Container>
        )
    }
}



