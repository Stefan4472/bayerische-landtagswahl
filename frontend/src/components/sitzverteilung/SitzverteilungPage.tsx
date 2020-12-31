import React from "react";
import {SitzverteilungChart} from "./SitzverteilungChart";
import {SitzverteilungTable} from "./SitzverteilungTable";
import {Card, Container} from "react-bootstrap";
import SitzverteilungEndpoints from "../../rest_client/SitzverteilungEndpoints";

interface Props {
    selectedYear: number,
}

interface State {
    // TODO: USE LIST INSTEAD
    sitzVerteilung: Map<string, number>,
}

export class SitzverteilungPage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            sitzVerteilung: new Map(),
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
        console.log('Fetching data for ', year);
        SitzverteilungEndpoints.getAll(this.props.selectedYear).then(data => {
            // Transform list into Map
            // TODO: JUST USE A LIST
            this.setState({
                sitzVerteilung: new Map(
                    data.map(rec => [rec.party_name, rec.num_seats])
                ),
            })
        });
    }

    render() {
        if (this.state.sitzVerteilung) {
            return (
                <Container>
                    <Card>
                        <Card.Body>
                            <SitzverteilungChart sitzVerteilung={this.state.sitzVerteilung}/>
                        </Card.Body>
                    </Card>
                    <div className={"my-1"}/>
                    <SitzverteilungTable sitzVerteilung={this.state.sitzVerteilung}/>
                </Container>
            )
        }
        else {
            return <div/>;
        }
    }
}



