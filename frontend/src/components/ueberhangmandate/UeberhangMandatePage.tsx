import React from "react";
import {Container} from "react-bootstrap";
import {UeberhangMandateTable} from "./UeberhangMandateTable";

interface Props {
    selectedYear: number,
}

// The "Ueberhangmandate" page
export class UeberhangMandatePage extends React.Component<Props> {
    render() {
        return (
            <Container>
                <UeberhangMandateTable selectedYear={this.props.selectedYear}/>
            </Container>
        )
    }
}