import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


export interface Mitglied {
    fname: string,
    lname: string,
    party: string,
    wahlkreis: string,
}

interface Props {

}

interface State {
    mitglieder: Mitglied[],
}

export class MitgliederTable extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            mitglieder: [],
        };
    }

    componentDidMount() {
        fetch('/api/results/elected-candidates')
            .then(response => response.json())
            .then(data => {
                // Sort the data alphabetically by first name
                data.sort((a: Mitglied, b: Mitglied) => (a.fname > b.fname) ? 1 : -1);
                this.setState({
                    mitglieder: data,
                });
            });
    }

    // TODO: THIS ONLY HAS TO BE DONE ONCE
    formatData(mitglieder: Mitglied[]) {
        return mitglieder.map((mitglied, index) => {
            return {
                'id': index,
                'fname': mitglied.fname,
                'lname': mitglied.lname,
                'party': mitglied.party,
                'wahlkreis': mitglied.wahlkreis,
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
                        dataField: 'fname',
                        text: 'Vorname',
                        sort: true,
                    },
                    {
                        dataField: 'lname',
                        text: 'Nachname',
                        sort: true,
                    },
                    {
                        dataField: 'party',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'wahlkreis',
                        text: 'Wahlkreis',
                        sort: true,
                    }
                ]}
                data={this.formatData(this.state.mitglieder)}
                striped
            />
        )
    }
}
