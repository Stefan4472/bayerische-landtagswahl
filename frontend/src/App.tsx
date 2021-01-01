import React from "react";
import {Jumbotron, Container, Navbar, Nav, Form, Card} from "react-bootstrap";
import {BrowserRouter, Switch, Route} from "react-router-dom"
import {StimmkreisPage} from "./components/stimmkreise/StimmkreisPage";
import {MitgliederPage} from "./components/mitglieder/MitgliederPage";
import {SitzverteilungPage} from "./components/sitzverteilung/SitzverteilungPage";
import "./App.css"
import WahlEndpoints from "./rest_client/WahlEndpoints";
import {UeberhangMandatePage} from "./components/ueberhangmandate/UeberhangMandatePage";

interface State {
    selectedYear: number,
    possibleYears: number[],
}

export class App extends React.Component {
    state: State;

    constructor() {
        super({});
        this.state = {
            selectedYear: 2018,
            possibleYears: [2018,],
        }
    }

    // Fetch the list of supported election years
    componentDidMount() {
        WahlEndpoints.getAllYears().then(data => {
            this.setState({
                possibleYears: data,
            })
        })
    }

    // Handle user changing the year they want to view data from
    onYearChanged(newYear: number) {
        this.setState({
            selectedYear: newYear,
        });
    }

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
                                    <Nav.Link href="/ueberhangmandate">Überhangmandate</Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                    </Container>

                    <Container>
                        <h2>Das Bayerische Landtagswahl System</h2>
                        <p>This website stores data from Bavarian State Parliament elections. It can be used to view and analyze the results from a given election (use the "Wahljahr Auswahl", below) and to compare data between elections.</p>
                        {/*Year selection*/}
                        <Card>
                            <Card.Body>
                                <Form>
                                    <Form.Label>Wahljahr Auswahl</Form.Label>
                                    <Form.Control
                                        as="select"
                                        custom
                                        onChange={(event: { target: { value: any; }; }) => {this.onYearChanged(event.target.value)}}
                                    >
                                        {this.state.possibleYears.map(year => {
                                            if (year === this.state.selectedYear) {
                                                return <option value={year} selected>{year}</option>
                                            }
                                            else {
                                                return <option value={year}>{year}</option>
                                            }
                                        })}
                                    </Form.Control>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Container>
                    <hr/>

                    {/*Content*/}
                    <Switch>
                        <Route exact path={"/"}>
                            <SitzverteilungPage selectedYear={this.state.selectedYear}/>
                        </Route>
                        <Route exact path={"/mitglieder"}>
                            <MitgliederPage selectedYear={this.state.selectedYear}/>
                        </Route>
                        <Route exact path={"/stimmkreise"}>
                            <StimmkreisPage selectedYear={this.state.selectedYear}/>
                        </Route>
                        <Route exact path={"/ueberhangmandate"}>
                            <UeberhangMandatePage selectedYear={this.state.selectedYear}/>
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        )
    }
}
