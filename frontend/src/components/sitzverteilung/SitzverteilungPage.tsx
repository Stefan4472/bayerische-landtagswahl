import React from "react";
import {SitzverteilungChart} from "./SitzverteilungChart";
import {SitzverteilungTable} from "./SitzverteilungTable";
import {Card, Container} from "react-bootstrap";
import SitzverteilungEndpoints, {SitzVerteilung} from "../../rest_client/SitzverteilungEndpoints";

interface Props {
    selectedYear: number,
}

interface State {
    sitzVerteilung: SitzVerteilung[],
}

export class SitzverteilungPage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            sitzVerteilung: [],
        };
    }

    componentDidMount() {
        this.fetchDataAndSetState(this.props.selectedYear);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        // Re-fetch data if selected year has changed
        if (prevProps.selectedYear !== this.props.selectedYear) {
            this.fetchDataAndSetState(this.props.selectedYear);
        }
    }

    fetchDataAndSetState(year: number) {
        SitzverteilungEndpoints.getAll(year).then(data => {
            // Sort by number of seats, decreasing
            data.sort((a, b) => (a.num_seats > b.num_seats) ? -1 : 1);
            this.setState({
                sitzVerteilung: data,
            })
        });
    }

    render() {
        return (
            <Container>
                <h3>Sitzverteilung ({this.props.selectedYear})</h3>
                <hr/>
                <Card>
                    <Card.Body>
                        <SitzverteilungChart
                            sitzVerteilung={this.state.sitzVerteilung}
                        />
                    </Card.Body>
                </Card>
                <div className={"my-1"}/>
                <SitzverteilungTable
                    sitzVerteilung={this.state.sitzVerteilung}
                />
                <div className={"clearfix"}>
                    <a className={"float-right"} href={"#mitglieder"}>Sehe alle Mitglieder {">"}</a>
                </div>
            </Container>
        )
    }
}