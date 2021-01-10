import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {SitzVerteilung} from "../../rest_client/SitzverteilungEndpoints";


interface Props {
    sitzVerteilung: SitzVerteilung[],
}

export class SitzverteilungTable extends React.Component<Props> {
    render() {
        return (
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
                        dataField: 'num_seats',
                        text: 'Sitze',
                        sort: true,
                    }
                ]}
                data={this.props.sitzVerteilung}
                striped
            />
        )
    }
}
