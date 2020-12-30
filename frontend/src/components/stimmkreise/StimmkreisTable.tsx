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
                // TODO: SHOW CANDIDATE'S FULL NAME, NOT JUST FIRSTNAME
                <BootstrapTable
                    bootstrap4
                    keyField={'party'}
                    columns={[
                        {
                            dataField: 'party_name',
                            text: 'Partei',
                            sort: true,
                        },
                        {
                            dataField: 'candidate_lname',
                            text: 'Kandidat',
                            sort: true,
                        },
                        {
                            dataField: 'erst_stimmen',
                            text: 'Erststimmen',
                            sort: true,
                        },
                        {
                            dataField: 'gesamt_stimmen',
                            text: 'Gesamtstimmen',
                            sort: true,
                        }
                    ]}
                    data={this.props.stimmkreis.results}
                    striped
                />
            )
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



