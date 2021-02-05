import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {KnappsteSieger} from "../../rest_client/SiegerEndpoints";

interface Props {
    sieger: KnappsteSieger[],
}

export class KnappsteSiegerTable extends React.Component<Props> {
    formatData(sieger: KnappsteSieger[]) {
        console.log('hi');
        return sieger.map((sieger, index) => {
            return {
                'id': index,
                'stimmkreis': '(' + sieger.stimmkreis_num + ') ' + sieger.stimmkreis_name,
                'party_name': sieger.party_name,
                'candidate': sieger.candidate_fname + ' ' + sieger.candidate_lname,
                'margin': sieger.win_margin,
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
                        text: 'Sieger Partei',
                        sort: true,
                    },
                    {
                        dataField: 'candidate',
                        text: 'Kandidat',
                        sort: true
                    },
                    {
                        dataField: 'margin',
                        text: 'Vorsprung',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toLocaleString()}</span>
                        )
                    },
                ]}
                data={this.formatData(this.props.sieger)}
                striped
            />
        )
    }
}
