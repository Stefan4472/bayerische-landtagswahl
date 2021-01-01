import React from "react";
import {ListGroup} from "react-bootstrap";
import StimmkreisEndpoints, {StimmkreisInfo} from "../../rest_client/StimmkreisEndpoints";

interface Props {
    selectedYear: number,
    filterText?: string,
    onSelect: (stimmkreisInfo: StimmkreisInfo)=>void;
}

interface State {
    currSelectedID?: number,
    stimmkreisInfo: StimmkreisInfo[];
}

export class StimmkreisSelector extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            stimmkreisInfo: [],
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
        StimmkreisEndpoints.getAllInfo(year).then(data => {
            this.setState({
                stimmkreisInfo: data,
            });
            // Select the first Stimmkreis by default
            if (data.length) {
                this.setSelection(data[0]);
            }
        })
    }
    performFilter(stimmkreise: StimmkreisInfo[], filterTerm: string|undefined) : StimmkreisInfo[] {
        if (filterTerm === '' || !filterTerm) {
            return stimmkreise;
        }

        return stimmkreise.filter((stimmkreis) => {
            return stimmkreis.name.startsWith(filterTerm) ||
                stimmkreis.number.toString().startsWith(filterTerm);
        });
    }

    // Handle user clicking to select a Stimmkreis to show
    setSelection(stimmkreis: StimmkreisInfo) {
        // Update state, then tell the parent about the new selection
        this.setState({
            currSelectedID: stimmkreis.id,
        }, () => {this.props.onSelect(stimmkreis)});
    }

    render() {
        return (
            // List of Stimmkreis buttons
            <ListGroup>
                {this.performFilter(this.state.stimmkreisInfo, this.props.filterText).map((info) => {
                    // Set the currently-selected stimmkreis to "active"
                    if (info.id === this.state.currSelectedID) {
                        return <ListGroup.Item active action onClick={() => this.setSelection(info)} key={info.number}>({info.number}) {info.name}</ListGroup.Item>
                    }
                    else {
                        return <ListGroup.Item action onClick={() => this.setSelection(info)} key={info.number}>({info.number}) {info.name}</ListGroup.Item>
                    }
                })}
            </ListGroup>
        )
    }
}