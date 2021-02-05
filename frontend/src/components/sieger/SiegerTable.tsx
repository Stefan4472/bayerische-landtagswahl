import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {StimmkreisSieger} from "../../rest_client/SiegerEndpoints";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

interface Props {
    sieger: StimmkreisSieger[],
}

export class SiegerTable extends React.Component<Props> {
    formatData(sieger: StimmkreisSieger[]) {
        return sieger.map((sieger, index) => {
            return {
                'id': index,
                'wahlkreis': sieger.wahlkreis,
                'stimmkreis': '(' + sieger.stimmkreis_num + ') ' + sieger.stimmkreis_name,
                'party_name': sieger.party_name,
                'erststimmen': sieger.num_erststimmen,
                'zweitstimmen': sieger.num_zweitstimmen,
                'percent': sieger.percent + '%',
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
                        dataField: 'wahlkreis',
                        text: 'Wahlkreis',
                        sort: true,
                    },
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
                    {
                        dataField: 'percent',
                        text: 'Gesamtstimmen-\nanteil',
                        sort: true
                    }
                ]}
                data={this.formatData(this.props.sieger)}
                striped
            />
        )
    }
}
