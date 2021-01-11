import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {UeberhangMandat} from "../../rest_client/UeberhangMandateEndpoints";

interface Props {
    mandates: UeberhangMandat[],
}

export class UeberhangMandateTable extends React.Component<Props> {
    formatData(mandates: UeberhangMandat[]) {
        return mandates.map((mandat, index) => {
            return {
                'id': index,
                'party_name': mandat.party_name,
                'wahlkreis_name': mandat.wahlkreis_name,
                'num_mandates': mandat.num_mandates,
            }
        });
    }

    render() {
        return (
            <BootstrapTable
                bootstrap4
                keyField={'id'}
                columns={[
                    {
                        dataField: 'party_name',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'wahlkreis_name',
                        text: 'Wahlkreis',
                        sort: true,
                    },
                    {
                        dataField: 'num_mandates',
                        text: 'Mandate',
                        sort: true,
                    },
                ]}
                data={this.formatData(this.props.mandates)}
                striped
            />
        )
    }
}
