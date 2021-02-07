import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {PartyBestStimmkreis} from "../../rest_client/WahlEndpoints";

interface Props {
    stimmkreise: PartyBestStimmkreis[],
}

export class PartyBestsTable extends React.Component<Props> {
    formatData(stimmkreise: PartyBestStimmkreis[]) {
        return stimmkreise.map((stimmkreis, index) => {
            return {
                'id': index,
                'stimmkreis': '(' + stimmkreis.stimmkreis_num + ') ' + stimmkreis.stimmkreis_name,
                'party_name': stimmkreis.party_name,
                'gesamt_stimmen': stimmkreis.num_gesamtstimmen,
                'percent_gesamt': stimmkreis.pct_gesamtstimmen,
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
                        dataField: 'stimmkreis',
                        text: 'Stimmkreis',
                        sort: true,
                    },
                    {
                        dataField: 'gesamt_stimmen',
                        text: 'Gesamtstimmen',
                        sort: true
                    },
                    {
                        dataField: 'percent_gesamt',
                        text: '%',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toFixed(2)}%</span>
                        )
                    },
                ]}
                data={this.formatData(this.props.stimmkreise)}
                striped
            />
        )
    }
}
