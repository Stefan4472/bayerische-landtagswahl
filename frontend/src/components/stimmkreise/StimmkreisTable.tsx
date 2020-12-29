import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
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
        // TODO: MAKE `STIMMKREIS` A REQUIRED PROP
        if (this.props.stimmkreis) {
            return (
                <BootstrapTable
                    bootstrap4
                    keyField={'party'}
                    columns={[
                        {
                            dataField: 'party',
                            text: 'Partei',
                            sort: true,
                        },
                        {
                            dataField: 'candidate',
                            text: 'Kandidat',
                            sort: true,
                        },
                        {
                            dataField: 'erststimmen',
                            text: 'Erststimmen',
                            sort: true,
                        },
                        {
                            dataField: 'zweitstimmen',
                            text: 'Zweitstimmen',
                            sort: true,
                        }
                    ]}
                    data={this.props.stimmkreis.results}
                    striped
                />
            )
            // // TODO: HOW TO SET ROW HEIGHT CORRECTLY?
            // return <Table striped bordered hover>
            //     <thead>
            //         <tr>
            //             <th>Partei</th>
            //             <th>Kandidat</th>
            //             <th>Ersttimmen</th>
            //             <th>Zweitstimmen</th>
            //         </tr>
            //     </thead>
            //     <tbody>
            //     {this.props.stimmkreis.results.map((result) =>
            //         <tr key={result.party}>
            //             <td>{result.party}</td>
            //             <td>{result.candidate}</td>
            //             <td>{result.erststimmen}</td>
            //             <td>{result.zweitstimmen}</td>
            //         </tr>
            //     )}
            //     </tbody>
            // </Table>
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



