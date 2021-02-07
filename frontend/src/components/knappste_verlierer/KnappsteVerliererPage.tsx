import React from "react";
import {Container} from "react-bootstrap";
import SiegerEndpoints, {KnappsteVerlierer} from "../../rest_client/SiegerEndpoints";
import {KnappsteVerliererTable} from "./KnappsteVerliererTable";

interface Props {
    selectedYear: number,
}

interface State {
    verlierer: KnappsteVerlierer[];
}

export class KnappsteVerliererPage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            verlierer: [],
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
        SiegerEndpoints.getKnappsteVerlierer(year).then(data => {
            this.setState({
                verlierer: data,
            })
        });
    }

    render() {
        return (
            <Container>
                <h3>Knappste Verlierer ({this.props.selectedYear})</h3>
                <hr/>
                <KnappsteVerliererTable verlierer={this.state.verlierer}/>
            </Container>
        )
    }
}



