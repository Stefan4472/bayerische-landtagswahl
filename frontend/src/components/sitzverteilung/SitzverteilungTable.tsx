import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


interface Props {
    sitzVerteilung: Map<string, number>,
}

export class SitzverteilungTable extends React.Component<Props> {

    formatData(sitzVerteilung: Map<string, number>) {
        let data: { party: string; numSeats: number; }[] = [];
        sitzVerteilung.forEach(function(value, key) {
                data.push({
                    party: key,
                    numSeats: value,
                });
            });
        return data;
    }

    render() {
        return (
            <BootstrapTable
                bootstrap4
                keyField={'party'}
                columns={[
                    {
                        dataField: 'party',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'numSeats',
                        text: 'Sitze',
                        sort: true,
                    }
                ]}
                data={this.formatData(this.props.sitzVerteilung)}
                striped
            />
        )
    }
}
