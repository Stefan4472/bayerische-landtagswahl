import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {KnappsteVerlierer} from "../../rest_client/SiegerEndpoints";

interface Props {
    verlierer: KnappsteVerlierer[],
}

export class KnappsteVerliererTable extends React.Component<Props> {
    formatData(verlierer: KnappsteVerlierer[]) {
        return verlierer.map((verlierer, index) => {
            return {
                'id': index,
                'stimmkreis': '(' + verlierer.stimmkreis_num + ') ' + verlierer.stimmkreis_name,
                'party_name': verlierer.party_name,
                'candidate': verlierer.candidate_fname + ' ' + verlierer.candidate_lname,
                'margin': verlierer.lose_margin,
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
                        dataField: 'stimmkreis',
                        text: 'Stimmkreis',
                        sort: true,
                    },
                    {
                        dataField: 'party_name',
                        text: 'Verlierer  Partei',
                        sort: true,
                    },
                    {
                        dataField: 'candidate',
                        text: 'Kandidat',
                        sort: true
                    },
                    {
                        dataField: 'margin',
                        text: 'Rückstand',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toLocaleString()}</span>
                        )
                    },
                ]}
                data={this.formatData(this.props.verlierer)}
                striped
            />
        )
    }
}
