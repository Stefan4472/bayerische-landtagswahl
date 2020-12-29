import React from "react";
import {Jumbotron, Container, Navbar, Row, Nav} from "react-bootstrap";
import "./App.css"
import {StimmkreisDisplayer} from "./StimmkreisDisplayer";
import {SitzverteilungOverview} from "./SitzverteilungOverview";
import {BrowserRouter, Switch, Route, Link} from "react-router-dom"

export class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div className="App">
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
                                    <Nav.Link href="/">Sitzverteilung</Nav.Link>
                                    <Nav.Link href="/mitglieder">Mitglieder</Nav.Link>
                                    <Nav.Link href="/stimmkreise">Stimmkreise</Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                    </Container>

                    <Switch>
                        <Route path={"/mitglieder"}>
                            <Container>
                                <p>Placeholder</p>
                            </Container>
                        </Route>
                        <Route path={"/stimmkreise"}>
                            <Container>
                                <StimmkreisDisplayer/>
                            </Container>
                        </Route>
                        {/*Home page: show Sitzverteilung*/}
                        <Route path={"/"}>
                            <Container>
                                <Row className="mb-2">
                                    <h2>Das Bayerische Landtagswahl System</h2>
                                    <p>This website stores data from Bavarian State Parliament elections. It can be used to view and analyze the results from a given election (use the "Wahljahr Auswahl", below) and to compare data between elections.</p>
                                </Row>
                                <SitzverteilungOverview/>
                            </Container>
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        )
    }
}
