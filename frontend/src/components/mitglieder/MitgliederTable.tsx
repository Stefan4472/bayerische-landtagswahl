import React from "react";
import {Table} from "react-bootstrap";

export interface Mitglied {
    fname: string,
    lname: string,
    party: string,
    wahlkreis: string,
}

interface Props {

}

interface State {
    mitglieder: Mitglied[],
}

export class MitgliederTable extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            mitglieder: [],
        };
    }

    componentDidMount() {
        fetch('/api/results/elected-candidates')
            .then(response => response.json())
            .then(data => {
                // Sort the data alphabetically by first name
                data.sort((a: Mitglied, b: Mitglied) => (a.fname > b.fname) ? 1 : -1);
                this.setState({
                    mitglieder: data,
                });
            });
    }

    render() {
        return <Table striped bordered hover>
            <thead>
            <tr>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Partei</th>
                <th>Wahlkreis</th>
            </tr>
            </thead>
            <tbody>
            {this.state.mitglieder.map((mitglied, index) =>
                <tr key={'mitglied-' + index}>
                    <td>{mitglied.fname}</td>
                    <td>{mitglied.lname}</td>
                    <td>{mitglied.party}</td>
                    <td>{mitglied.wahlkreis}</td>
                </tr>
            )}
            </tbody>
        </Table>
    }
}
