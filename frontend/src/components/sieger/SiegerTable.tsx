import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {StimmkreisSieger} from "../../rest_client/StimmkreisEndpoints";

interface Props {
    sieger: StimmkreisSieger[],
}

export class SiegerTable extends React.Component<Props> {
    formatData(sieger: StimmkreisSieger[]) {
        return sieger.map((sieger, index) => {
            return {
                'id': index,
                'stimmkreis': '(' + sieger.stimmkreis_num + ') ' + sieger.stimmkreis_name,
                'party_name': sieger.party_name,
                'erststimmen': sieger.num_erststimmen,
                'zweitstimmen': sieger.num_zweitstimmen,
            }
        });
    }

    render() {
        // TODO: NEED ERST- AND ZWEIT- PERCENTAGES
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
                        dataField: 'erststimmen',
                        text: 'Num. Erststimmen',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toLocaleString()}</span>
                        )
                    },
                    {
                        dataField: 'zweitstimmen',
                        text: 'Num. Zweitstimmen',
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
