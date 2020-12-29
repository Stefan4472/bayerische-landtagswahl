import React from "react";
import {Container} from "react-bootstrap";
import {MitgliederTable} from "./MitgliederTable";

// The "Mitglieder" page
export class MitgliederPage extends React.Component {
    render() {
        return (
            <Container>
                <MitgliederTable/>
            </Container>
        )
    }
}