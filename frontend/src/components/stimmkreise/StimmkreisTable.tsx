import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {Stimmkreis, StimmkreisPartyResult} from "../../rest_client/StimmkreisEndpoints";

interface Props {
    stimmkreis?: Stimmkreis,
}

export class StimmkreisTable extends React.Component<Props> {

    formatData(results: StimmkreisPartyResult[]) {
        return results.map((result) => {
            return {
                'party_name': result.party_name,
                'candidate': result.candidate_lname + ', ' + result.candidate_lname,
                'erststimmen': result.erst_stimmen,
                'gesamtstimmen': result.gesamt_stimmen,
            }
        });
    }

    render() {
        return (
            <BootstrapTable
                bootstrap4
                keyField={'party_name'}
                columns={[
                    {
                        dataField: 'party_name',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'candidate',
                        text: 'Kandidat',
                        sort: true,
                    },
                    {
                        dataField: 'erststimmen',
                        text: 'Erststimmen',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toLocaleString()}</span>
                        )
                    },
                    {
                        dataField: 'gesamtstimmen',
                        text: 'Gesamtstimmen',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toLocaleString()}</span>
                        )
                    }
                ]}
                data={this.props.stimmkreis ? this.formatData(this.props.stimmkreis.results) : []}
                striped
            />
        )
    }
}



