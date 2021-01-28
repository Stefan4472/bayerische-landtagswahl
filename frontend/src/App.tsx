import React, {useEffect, useState} from "react";
import {Jumbotron, Container, Navbar, Nav, Form, NavDropdown, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Switch, Route, HashRouter, useParams, useHistory} from "react-router-dom"
import RefreshIcon from '@material-ui/icons/Refresh';
import {StimmkreisPage} from "./components/stimmkreise/StimmkreisPage";
import {MitgliederPage} from "./components/mitglieder/MitgliederPage";
import {SitzverteilungPage} from "./components/sitzverteilung/SitzverteilungPage";
import "./App.css"
import WahlEndpoints from "./rest_client/WahlEndpoints";
import {UeberhangMandatePage} from "./components/ueberhangmandate/UeberhangMandatePage";
import {SiegerPage} from "./components/sieger/SiegerPage";
import {StimmabgabePage} from "./components/stimmabgabe/StimmabgabePage";


export const App: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<number>(2018);
    const [possibleYears, setPossibleYears] = useState<number[]>([2018,]);
    const history = useHistory();

    // Fetch the list of supported election years
    useEffect(() => {
        // console.log(urlYear);

        WahlEndpoints.getAllYears().then(data => {
            setPossibleYears(data)
        })
    }, [])

    // Handle user changing the year they want to view data from
    function onYearChanged(newYear: number) {
        setSelectedYear(newYear);
    }

    const reportYear = (year: number) => {
        console.log('Got year ', year);
        // if (year === undefined) {
        //     history.push('/2018')
        // }
        setSelectedYear(year);
    }

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
                                <Nav.Link href="#stimmkreise">Stimmkreise</Nav.Link>
                                <NavDropdown title="Daten" id={"data-dropdown"}>
                                    <NavDropdown.Item href="#mitglieder">Mitglieder</NavDropdown.Item>
                                    <NavDropdown.Item href="#ueberhangmandate">Überhangmandate</NavDropdown.Item>
                                    <NavDropdown.Item href="#sieger">Sieger</NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link href="#stimmabgabe">Stimmabgabe</Nav.Link>
                            </Nav>
                            <Nav className={"ml-auto"}>
                                <Form inline>
                                    <Form.Label><Navbar.Text>Wahljahr Auswahl</Navbar.Text></Form.Label>
                                    <Form.Control
                                        as="select"
                                        custom
                                        className={"ml-2"}
                                        onChange={(event: { target: { value: any; }; }) => {onYearChanged(event.target.value)}}
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
                                       className={"pr-0"}
                                       variant={"link"}
                                       style={{"color": "gray"}}
                                       onClick={() => {
                                           WahlEndpoints.forceDataRefresh();
                                           alert('Data updated. Please reload');
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
                        <MitgliederPage selectedYear={selectedYear}/>
                    </Route>
                    <Route exact path={"/stimmkreise"}>
                        <StimmkreisPage selectedYear={selectedYear}/>
                    </Route>
                    <Route exact path={"/ueberhangmandate"}>
                        <UeberhangMandatePage selectedYear={selectedYear}/>
                    </Route>
                    <Route exact path={"/stimmabgabe"}>
                        <StimmabgabePage/>
                    </Route>
                    <Route exact path={"/sieger"}>
                        <SiegerPage selectedYear={selectedYear}/>
                    </Route>
                    <Route path={"/:year?"}>
                        <Child reportYear={(year: number) => reportYear(year)}/>
                        {/*<SitzverteilungPage selectedYear={selectedYear}/>*/}
                    </Route>
                </Switch>
            </div>
        </HashRouter>
    )
}

interface ChildProps {
    reportYear: (year: number) => void
}

const Child : React.FC<ChildProps> = (props: ChildProps) => {
    let urlParams: {year?: string|undefined} = useParams();
    const history = useHistory();

    useEffect(() => {
        console.log(urlParams);
        // No year set: redirect to the latest year in the database
        if (urlParams.year === undefined) {
            WahlEndpoints.getAllYears().then((years) => {
                history.push('/' + years[1])
            })
        }
        else {
            props.reportYear(Number(urlParams.year));
        }
    }, [urlParams])

    return (
        <div>
            {urlParams.year ? (
                <SitzverteilungPage selectedYear={Number(urlParams.year)}/>
            ) : (
                <div/>
            )}
        </div>
    );
}