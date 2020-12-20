import {TestComp} from "./Test"
import {Jumbotron, Container, Navbar} from "react-bootstrap";
import "./App.css"
import React from "react";

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

            <Container>
                {/*Navbar*/}
                <Navbar className="navbar navbar-expand-lg navbar-light bg-light rounded" style={{marginBottom: "2rem"}}>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav justify-content-center">
                            <li className="nav-item active">
                                <a className="nav-link" href="%PUBLIC_URL%">Ergebnisse <span className="sr-only">(current)</span></a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" href="%PUBLIC_URL%">Kandidaten</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" href="%PUBLIC_URL%">Wahlkreise</a>
                            </li>
                            <li className="nav-item active">
                            <a className="nav-link" href="%PUBLIC_URL%">Stimmkreise</a>
                            </li>
                        </ul>
                    </div>
                </Navbar>

                {/*Content*/}
                <div className="row mb-2">
                    <div className="col-md-12">
                        <h2>Das Bayerische Landtagswahl System</h2>
                        <p>This website stores data from Bavarian State Parliament elections. It can be used to view and analyze the results from a given election (use the "Wahljahr Auswahl", below) and to compare data between elections.</p>
                    </div>
                </div>

                <p>Hello world</p>
                <TestComp/>
            </Container>
        </div>
    }
}
