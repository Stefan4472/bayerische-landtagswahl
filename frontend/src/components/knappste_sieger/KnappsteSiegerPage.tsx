import React from "react";
import {Container} from "react-bootstrap";
import SiegerEndpoints, {KnappsteSieger} from "../../rest_client/SiegerEndpoints";
import {KnappsteSiegerTable} from "./KnappsteSiegerTable";

interface Props {
    selectedYear: number,
}

interface State {
    sieger: KnappsteSieger[];
}

export class KnappsteSiegerPage extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            sieger: [],
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
        SiegerEndpoints.getKnappsteSieger(year).then(data => {
            console.log(data);
            this.setState({
                sieger: data,
            })
        });
    }

    render() {
        return (
            <Container>
                <h3>Knappste Sieger ({this.props.selectedYear})</h3>
                <hr/>
                <KnappsteSiegerTable sieger={this.state.sieger}/>
            </Container>
        )
    }
}



