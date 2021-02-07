import React from "react";
import {Container} from "react-bootstrap";
import {MitgliederTable} from "./MitgliederTable";

interface Props {
    selectedYear: number,
}

// The "Mitglieder" page
export class MitgliederPage extends React.Component<Props> {
    render() {
        return (
            <Container>
                <h3>Mitglieder ({this.props.selectedYear})</h3>
                <hr/>
                <MitgliederTable selectedYear={this.props.selectedYear}/>
            </Container>
        )
    }
}