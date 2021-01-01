import React from "react";
import {Container} from "react-bootstrap";
// import {MitgliederTable} from "./MitgliederTable";

interface Props {
    selectedYear: number,
}

// The "Ueberhangmandate" page
export class UeberhangMandatePage extends React.Component<Props> {
    render() {
        return (
            <Container>
                {/*<MitgliederTable selectedYear={this.props.selectedYear}/>*/}
            </Container>
        )
    }
}