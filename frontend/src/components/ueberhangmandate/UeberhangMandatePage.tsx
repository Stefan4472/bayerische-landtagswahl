import React from "react";
import {Container} from "react-bootstrap";
import {UeberhangMandateTable} from "./UeberhangMandateTable";
import UeberhangMandateEndpoints, {UeberhangMandat} from "../../rest_client/UeberhangMandateEndpoints";

interface Props {
    selectedYear: number,
}

interface State {
    mandates: UeberhangMandat[],
}

// The "Ueberhangmandate" page
export class UeberhangMandatePage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            mandates: [],
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
        UeberhangMandateEndpoints.getAll(year).then(data => {
            // Sort the data alphabetically by party name
            // data.sort((a, b) => (a.party_name > b.party_name) ? 1 : -1);
            this.setState({
                mandates: data,
            });
        });
    }

    render() {
        return (
            <Container>
                <UeberhangMandateTable
                    mandates={this.state.mandates}
                />
            </Container>
        )
    }
}