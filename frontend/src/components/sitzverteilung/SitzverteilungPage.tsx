import React from "react";
import {Container, Row} from "react-bootstrap";
import {SitzverteilungOverview} from "./SitzverteilungOverview";


// The "Sitzverteilung" page
export class SitzverteilungPage extends React.Component {

    render() {
        return (
            <Container>
                <SitzverteilungOverview/>
            </Container>
        )
    }
}