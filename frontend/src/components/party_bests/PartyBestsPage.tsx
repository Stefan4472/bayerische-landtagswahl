import React from "react";
import {Container} from "react-bootstrap";
import WahlEndpoints, {PartyBestStimmkreis} from "../../rest_client/WahlEndpoints";
import {PartyBestsTable} from "./PartyBestsTable";
import {orderParties} from "../util/PartyDisplay";

interface Props {
    selectedYear: number,
}

interface State {
    stimmkreise: PartyBestStimmkreis[];
}

export class PartyBestsPage extends React.Component<Props> {
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
        WahlEndpoints.getPartyBestStimmkreise(year).then(data => {
            this.setState({
                stimmkreise: orderParties(data),
            })
        });
    }

    render() {
        return (
            <Container>
                <PartyBestsTable stimmkreise={this.state.stimmkreise}/>
            </Container>
        )
    }
}



