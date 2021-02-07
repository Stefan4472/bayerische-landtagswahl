import React from "react";
import {Container} from "react-bootstrap";
import WahlEndpoints, {StimmkreisSwing} from "../../rest_client/WahlEndpoints";
import {StimmkreisSwingsTable} from "./StimmkreisSwingsTable";

interface Props {
    selectedYear: number,
}

interface State {
    stimmkreise: StimmkreisSwing[];
}

export class StimmkreisSwingsPage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            stimmkreise: [],
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
        WahlEndpoints.getStimmkreisSwings(year).then(data => {
            this.setState({
                stimmkreise: data,
            })
        });
    }

    render() {
        return (
            <Container>
                <h3>Ideologische Schwunge ({this.props.selectedYear})</h3>
                <hr/>
                <StimmkreisSwingsTable stimmkreise={this.state.stimmkreise}/>
            </Container>
        )
    }
}



