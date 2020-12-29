import React from "react";
import {Container} from "react-bootstrap";
import {StimmkreisDisplayer} from "./StimmkreisDisplayer";

// The "Stimmkreis" page
export class StimmkreisPage extends React.Component {
    render() {
        return (
            <Container>
                <StimmkreisDisplayer/>
            </Container>
        )
    }
}