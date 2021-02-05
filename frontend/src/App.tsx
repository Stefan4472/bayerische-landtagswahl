import React, {useEffect, useState} from "react";
import {Jumbotron, Container, Navbar, Nav, Form, NavDropdown, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Switch, Route, HashRouter} from "react-router-dom"
import RefreshIcon from '@material-ui/icons/Refresh';
import {StimmkreisPage} from "./components/stimmkreise/StimmkreisPage";
import {MitgliederPage} from "./components/mitglieder/MitgliederPage";
import {SitzverteilungPage} from "./components/sitzverteilung/SitzverteilungPage";
import "./App.css"
import WahlEndpoints from "./rest_client/WahlEndpoints";
import {UeberhangMandatePage} from "./components/ueberhangmandate/UeberhangMandatePage";
import {SiegerPage} from "./components/sieger/SiegerPage";
import {StimmabgabePage} from "./components/stimmabgabe/StimmabgabePage";
import {KnappsteSiegerPage} from "./components/knappste_sieger/KnappsteSiegerPage";
import {KnappsteVerliererPage} from "./components/knappste_verlierer/KnappsteVerliererPage";
import {PartyBestsPage} from "./components/party_bests/PartyBestsPage";


export const App: React.FC = () => {
    const [selectedYear, _setSelectedYear] = useState<number>();
    const [possibleYears, setPossibleYears] = useState<number[]>([]);

    // Sets `selectedYear` and saves to local storage.
    // Use this, rather than `_setSelectedYear`!
    function setSelectedYear(year: number) {
        console.log('Setting selected year');
        saveSelectedYear(year);
        _setSelectedYear(year);
    }

    // Save year to storage
    function saveSelectedYear(year: number) {
        localStorage.setItem('SELECTED_YEAR', year.toString());
    }

    // Restore year from storage
    function restoreSelectedYear() : number|undefined {
        let saved = localStorage.getItem('SELECTED_YEAR');
        return saved === undefined ? undefined : Number(saved);
    }

    useEffect(() => {
        console.log('Using effect');
        // Retrieve all years
        WahlEndpoints.getAllYears().then(data => {
            setPossibleYears(data)

            // Get selected year from storage
            let saved_year = restoreSelectedYear();
            if (saved_year === undefined) {
                // No year saved: set to the max possible year
                setSelectedYear(Math.max(...data));
            }
            else {
                setSelectedYear(saved_year);
            }
        })
    }, [])

    return (
        <HashRouter>
            <div className="App">
                {/* Banner */}
                {/* Image source: https://commons.wikimedia.org/wiki/File:Flag_of_Bavaria_(lozengy).svg */}
                <Jumbotron className={"site-jumbotron"} style={{
                    marginBottom: 0,
                    textAlign: "center",
                    backgroundImage: "url(bavarian-flag.png)",
                    backgroundSize: "cover",
                }}>
                    <h1 className="display-4"><a href="/" className="link-override">Bayerische Landtagswahl System</a></h1>
                </Jumbotron>

                {/*Navbar*/}
                <Container>
                    <Navbar collapseOnSelect expand="md" variant="light" bg="light" className="rounded" style={{marginBottom: "2rem"}}>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse>
                            {/*TODO: USE REACT-ROUTER-DOM LINK TAGS*/}
                            <Nav>
                                <Nav.Link href="/">Sitzverteilung</Nav.Link>
                                <Nav.Link href="#mitglieder">Mitglieder</Nav.Link>
                                <Nav.Link href="#stimmkreise">Stimmkreise</Nav.Link>
                                <NavDropdown title="Daten" id={"data-dropdown"}>
                                    <NavDropdown.Item href="#ueberhangmandate">Überhangmandate</NavDropdown.Item>
                                    <NavDropdown.Item href="#sieger">Stimmkreis Sieger</NavDropdown.Item>
                                    <NavDropdown.Item href={"#knappste-sieger"}>Knappste Sieger</NavDropdown.Item>
                                    <NavDropdown.Item href={"#knappste-verlierer"}>Knappste Verlierer </NavDropdown.Item>
                                    <NavDropdown.Item href={"#party-bests"}>Party Bests</NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link href="#stimmabgabe">Stimmabgabe</Nav.Link>
                            </Nav>
                            <Nav className={"ml-auto"}>
                                <Form inline className={"mr-2"}>
                                    <Form.Label><Navbar.Text>Wahljahr Auswahl</Navbar.Text></Form.Label>
                                    {/*Provide selector with all supported election years*/}
                                    <Form.Control
                                        as="select"
                                        custom
                                        className={"ml-2"}
                                        onChange={(event: { target: { value: any; }; }) => {setSelectedYear(event.target.value)}}
                                    >
                                        {possibleYears.map(year => {
                                            if (year === selectedYear) {
                                                return <option value={year} selected>{year}</option>
                                            }
                                            else {
                                                return <option value={year}>{year}</option>
                                            }
                                        })}
                                    </Form.Control>
                                </Form>
                                {/*Refresh button*/}
                                {/*TODO: MOVE THIS INTO THE SITE FOOTER? "RESULTS LAST UPDATED --:--:-- --/--. CLICK HERE TO RECALCULATE"*/}
                                <OverlayTrigger
                                    placement={'bottom'}
                                    overlay={
                                        <Tooltip id={`tooltip-refresh`}>
                                            Click here to recalculate results across the site. This process can take up to one minute.
                                        </Tooltip>
                                    }
                                >
                                   <Button
                                       className={"p-0"}
                                       variant={"link"}
                                       style={{"color": "gray"}}
                                       onClick={() => {
                                           WahlEndpoints.forceDataRefresh().then(() => {
                                               alert('Data updated. Please reload');
                                           });
                                       }}
                                   >
                                       <RefreshIcon/>
                                   </Button>
                                </OverlayTrigger>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                </Container>

                {/*Content*/}
                <Switch>
                    <Route exact path={"/mitglieder"}>
                        {selectedYear && <MitgliederPage selectedYear={selectedYear}/>}
                    </Route>
                    <Route exact path={"/stimmkreise"}>
                        {selectedYear && <StimmkreisPage selectedYear={selectedYear}/>}
                    </Route>
                    <Route exact path={"/ueberhangmandate"}>
                        {selectedYear && <UeberhangMandatePage selectedYear={selectedYear}/>}
                    </Route>
                    <Route exact path={"/stimmabgabe"}>
                        {selectedYear && <StimmabgabePage/>}
                    </Route>
                    <Route exact path={"/sieger"}>
                        {selectedYear && <SiegerPage selectedYear={selectedYear}/>}
                    </Route>
                    <Route exact path={"/knappste-sieger"}>
                        {selectedYear && <KnappsteSiegerPage selectedYear={selectedYear}/>}
                    </Route>
                    <Route exact path={"/knappste-verlierer"}>
                        {selectedYear && <KnappsteVerliererPage selectedYear={selectedYear}/>}
                    </Route>
                    <Route exact path={"/party-bests"}>
                        {selectedYear && <PartyBestsPage selectedYear={selectedYear}/>}
                    </Route>
                    <Route path={"/:year?"}>
                        {selectedYear && <SitzverteilungPage selectedYear={selectedYear}/>}
                    </Route>
                </Switch>
            </div>
        </HashRouter>
    )
}