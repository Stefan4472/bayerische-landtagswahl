import React from "react";
import {Jumbotron, Container, Navbar, Card, Row, Col, Nav} from "react-bootstrap";
import "./App.css"
import {StimmkreisDisplayer} from "./StimmkreisDisplayer";

export class App extends React.Component {
    render() {
        return <div className="App">
            {/* Banner */}
            {/* Image source: https://commons.wikimedia.org/wiki/File:Flag_of_Bavaria_(lozengy).svg */}
            <Jumbotron className={"site-jumbotron"} style={{
                marginBottom: 0,
                textAlign: "center",
                backgroundImage: "url(bavarian-flag.png)",
                backgroundSize: "cover",
            }}>
                <h1 className="display-4"><a href="%PUBLIC_URL%" className="link-override">Bayerische Landtagswahl System</a></h1>
            </Jumbotron>

            {/*Navbar*/}
            <Container>
                <Navbar collapseOnSelect expand="md" variant="light" bg="light" className="rounded" style={{marginBottom: "2rem"}}>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse>
                        <Nav className="mr-auto">
                            <Nav.Link href="#home">Ergebnisse</Nav.Link>
                            <Nav.Link href="#link">Kandidaten</Nav.Link>
                            <Nav.Link href="#link">Wahlkreise</Nav.Link>
                            <Nav.Link href="#link">Stimmkreise</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Container>


            <Container>
                {/*Content*/}
                <Row className="mb-2">
                    <h2>Das Bayerische Landtagswahl System</h2>
                    <p>This website stores data from Bavarian State Parliament elections. It can be used to view and analyze the results from a given election (use the "Wahljahr Auswahl", below) and to compare data between elections.</p>
                </Row>

                <StimmkreisDisplayer/>

                <Card className="mb-2">
                    <Card.Body>
                        <Card.Title>Stimmkreis Ergebnisse</Card.Title>
                        <Row>
                            <Col>
                                <div id="piechart-county"></div>
                            </Col>
                            <Col>
                                <table style={{width: "100%"}}>
                                    <tr>
                                        <th>Kandidat</th>
                                        <th>Partei</th>
                                        <th>Erststimmen</th>
                                        <th>Erststimmen (%)</th>
                                    </tr>
                                    <tr>
                                        <td>Benjamin Adjei*</td>
                                        <td>Gruene</td>
                                        <td>17.573</td>
                                        <td>26,2</td>
                                    </tr>
                                    <tr>
                                        <td>Mechthilde Wittmann</td>
                                        <td>CSU</td>
                                        <td>17.495</td>
                                        <td>26,1</td>
                                    </tr>
                                    <tr>
                                        <td>Diana Stachowitz</td>
                                        <td>SPD</td>
                                        <td>9.996</td>
                                        <td>14,9</td>
                                    </tr>
                                    <tr>
                                        <td>Michael Groß</td>
                                        <td>AfD</td>
                                        <td>5.462</td>
                                        <td>8,2</td>
                                    </tr>
                                    <tr>
                                        <td>Albert Duin</td>
                                        <td>FDP</td>
                                        <td>5.285</td>
                                        <td>7,9</td>
                                    </tr>
                                    <tr>
                                        <td>Lilian Edenhofer</td>
                                        <td>Freie Waehler</td>
                                        <td>4.462</td>
                                        <td>6,7</td>
                                    </tr>
                                    <tr>
                                        <td>Tony Luis Guerra</td>
                                        <td>Die Linke</td>
                                        <td>2.790</td>
                                        <td>4,2</td>
                                    </tr>
                                    <tr>
                                        <td>Sonstige</td>
                                        <td>...</td>
                                        <td>...</td>
                                        <td>...</td>
                                    </tr>
                                </table>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    }
}
