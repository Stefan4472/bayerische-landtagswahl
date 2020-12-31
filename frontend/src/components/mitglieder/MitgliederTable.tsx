import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import MitgliederEndpoints, {Mitglied} from "../../rest_client/MitgliederEndpoints";

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
        MitgliederEndpoints.getAll().then(data => {
            // Sort the data alphabetically by first name
            data.sort((a, b) => (a.first_name > b.first_name) ? 1 : -1);
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
                'first_name': mitglied.first_name,
                'last_name': mitglied.last_name,
                'party_name': mitglied.party_name,
                'wahlkreis_name': mitglied.wahlkreis_name,
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
                        dataField: 'first_name',
                        text: 'Vorname',
                        sort: true,
                    },
                    {
                        dataField: 'last_name',
                        text: 'Nachname',
                        sort: true,
                    },
                    {
                        dataField: 'party_name',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'wahlkreis_name',
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
