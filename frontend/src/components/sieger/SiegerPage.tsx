import React from "react";
import {Container} from "react-bootstrap";
import StimmkreisEndpoints, {StimmkreisSieger} from "../../rest_client/StimmkreisEndpoints";
import {SiegerTable} from "./SiegerTable";

interface Props {
    selectedYear: number,
}

interface State {
    sieger: StimmkreisSieger[];
}

export class SiegerPage extends React.Component<Props> {
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
        StimmkreisEndpoints.getAllSieger(year).then(data => {
            console.log(data);
            this.setState({
                sieger: data,
            })
        });
    }

    render() {
        return (
            <Container>
                <SiegerTable sieger={this.state.sieger}/>
            </Container>
        )
    }
}



