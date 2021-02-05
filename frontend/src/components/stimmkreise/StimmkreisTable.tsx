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
                'candidate': result.candidate_lname + ', ' + result.candidate_fname,
                'erststimmen': result.erst_stimmen,
                'zweitstimmen': result.zweit_stimmen,
                'gesamtstimmen': result.gesamt_stimmen,
                'gesamtpercent': result.gesamt_percent,
                'changepercent': result.change_percent,
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
                        text: 'Direkt Kandidat',
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
                        dataField: 'zweitstimmen',
                        text: 'Zweitstimmen',
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
                    },
                    {
                        dataField: 'gesamtpercent',
                        text: '%',
                        sort: true,
                        formatter: (value) => (
                            <span>{value.toFixed(2) + "%"}</span>
                        )
                    },
                    {
                        dataField: 'changepercent',
                        text: 'Änderung',
                        sort: true,
                        formatter: (value) => (
                            <span>{value ? (value > 0 ? '+' : '') + value.toFixed(2) + "%" : ''}</span>
                        ),
                        // Custom sorting function to handle empty strings. Kinda ugly
                        sortFunc: (a, b, order, dataField, rowA, rowB) => {
                            console.log(a, b);
                            let is_a_bigger: boolean;
                            if (a !== '' && b === '') {
                                is_a_bigger = true;
                            }
                            else if (a === '' && b !== '') {
                                is_a_bigger = false;
                            }
                            else if (a !== '' && b !== '') {
                                is_a_bigger = (a > b);
                            }
                            else {
                                is_a_bigger = true;
                            }
                            if (order === 'asc') {
                                return is_a_bigger ? 1 : -1;
                            }
                            else {
                                return is_a_bigger ? -1 : 1;
                            }
                        }
                    }
                ]}
                data={this.props.stimmkreis ? this.formatData(this.props.stimmkreis.results) : []}
                striped
            />
        )
    }
}



