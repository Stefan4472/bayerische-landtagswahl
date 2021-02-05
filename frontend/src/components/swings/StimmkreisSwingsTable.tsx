import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {StimmkreisSwing} from "../../rest_client/WahlEndpoints";

interface Props {
    stimmkreise: StimmkreisSwing[],
}

export class StimmkreisSwingsTable extends React.Component<Props> {
    formatData(stimmkreise: StimmkreisSwing[]) {
        return stimmkreise.map((stimmkreis, index) => {
            return {
                'id': index,
                'stimmkreis': '(' + stimmkreis.stimmkreis_num + ') ' + stimmkreis.stimmkreis_name,
                'change_left': stimmkreis.pct_change_left,
                'change_right': stimmkreis.pct_change_right,
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
                        dataField: 'change_left',
                        text: 'Änderung Links',
                        sort: true,
                        formatter: (value) => (
                            <span>{value ? (value > 0 ? '+' : '') + value.toFixed(2) + "%" : ''}</span>
                        )
                    },
                    {
                        dataField: 'change_right',
                        text: 'Änderung Rechts',
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
