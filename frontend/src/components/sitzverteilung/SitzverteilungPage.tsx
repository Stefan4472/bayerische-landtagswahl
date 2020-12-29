import React from "react";
import {Container, Row} from "react-bootstrap";
import {SitzverteilungOverview} from "./SitzverteilungOverview";


// The "Sitzverteilung" page
export class SitzverteilungPage extends React.Component {

    render() {
        return (
            <Container>
                <Row className="mb-2">
                    <h2>Das Bayerische Landtagswahl System</h2>
                    <p>This website stores data from Bavarian State Parliament elections. It can be used to view and analyze the results from a given election (use the "Wahljahr Auswahl", below) and to compare data between elections.</p>
                </Row>
                <SitzverteilungOverview/>
            </Container>
        )
    }
}