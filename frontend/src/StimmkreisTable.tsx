import {Table} from "react-bootstrap";
import React from "react";
import {Stimmkreis} from "./StimmkreisDisplayer";

interface Props {
    stimmkreis?: Stimmkreis,
}

interface State {

}

export class StimmkreisTable extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.stimmkreis) {
            // TODO: HOW TO SET ROW HEIGHT CORRECTLY?
            return <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Partei</th>
                        <th>Kandidat</th>
                        <th>Ersttimmen</th>
                        <th>Zweitstimmen</th>
                    </tr>
                </thead>
                <tbody>
                {this.props.stimmkreis.results.map((result) =>
                    <tr key={result.party}>
                        <td>{result.party}</td>
                        <td>{result.candidate}</td>
                        <td>{result.erststimmen}</td>
                        <td>{result.zweitstimmen}</td>
                    </tr>
                )}
                </tbody>
            </Table>
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



