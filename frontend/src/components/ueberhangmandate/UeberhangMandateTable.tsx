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
                'sitze': mandat.sitze,
                'ueberhangmandate': mandat.ueberhangmandate,
                'ausgleichsmandate': mandat.ausgleichsmandate
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
                        dataField: 'wahlkreis_name',
                        text: 'Wahlkreis',
                        sort: true,
                    },
                    {
                        dataField: 'party_name',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'sitze',
                        text: 'Sitze',
                        sort: true,
                    },
                    {
                        dataField: 'ueberhangmandate',
                        text: 'Überhangmandate',
                        sort: true,
                    },
                    {
                        dataField: 'ausgleichsmandate',
                        text: 'Ausgleichsmandate',
                        sort: true,
                    }
                ]}
                data={this.formatData(this.props.mandates)}
                striped
            />
        )
    }
}
