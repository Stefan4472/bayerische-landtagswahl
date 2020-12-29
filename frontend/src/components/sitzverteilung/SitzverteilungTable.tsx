import {Table} from "react-bootstrap";
import React from "react";

interface Props {
    sitzVerteilung: Map<string, number>,
}

interface State {

}

export class SitzverteilungTable extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    formatData(sitzVerteilung: Map<string, number>) {
        let data: { party: string; numSeats: number; }[] = [];
        this.props.sitzVerteilung.forEach(function(value, key) {
                data.push({
                    party: key,
                    numSeats: value,
                });
            });
        return data;
    }

    render() {
        return <Table striped bordered hover>
            <thead>
            <tr>
                <th>Partei</th>
                <th>Sitze</th>
            </tr>
            </thead>
            <tbody>
            {this.formatData(this.props.sitzVerteilung).map((result) =>
                <tr key={result.party}>
                    <td>{result.party}</td>
                    <td>{result.numSeats}</td>
                </tr>
            )}
            </tbody>
        </Table>
    }
}
