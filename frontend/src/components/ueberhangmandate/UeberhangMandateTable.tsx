import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import UeberhangMandateEndpoints, {UeberhangMandat} from "../../rest_client/UeberhangMandateEndpoints";

interface Props {
    selectedYear: number,
}

interface State {
    mandates: UeberhangMandat[],
}

export class UeberhangMandateTable extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            mandates: [],
        };
    }

    componentDidMount() {
        this.fetchDataAndSetState(this.props.selectedYear);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        // Re-fetch data if selected year has changed
        if (prevProps.selectedYear !== this.props.selectedYear) {
            this.fetchDataAndSetState(this.props.selectedYear);
        }
    }

    fetchDataAndSetState(year: number) {
        UeberhangMandateEndpoints.getAll(year).then(data => {
            console.log(data)
            // Sort the data alphabetically by party name
            data.sort((a, b) => (a.party_name > b.party_name) ? 1 : -1);
            this.setState({
                mandates: data,
            });
        });
    }

    // TODO: THIS ONLY HAS TO BE DONE ONCE
    formatData(mandates: UeberhangMandat[]) {
        return mandates.map((mandat, index) => {
            return {
                'id': index,
                'party_name': mandat.party_name,
                'wahlkreis_name': mandat.wahlkreis_name,
                'num_mandates': mandat.num_mandates,
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
                        dataField: 'party_name',
                        text: 'Partei',
                        sort: true,
                    },
                    {
                        dataField: 'wahlkreis_name',
                        text: 'Wahlkreis',
                        sort: true,
                    },
                    {
                        dataField: 'num_mandates',
                        text: 'Mandate',
                        sort: true,
                    },
                ]}
                data={this.formatData(this.state.mandates)}
                striped
            />
        )
    }
}
