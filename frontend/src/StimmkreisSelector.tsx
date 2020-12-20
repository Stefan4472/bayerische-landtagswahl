import React from "react";
import {ListGroup} from "react-bootstrap";

export interface StimmkreisInfo {
    id: number;
    name: string;
    number: number;
}

interface Props {
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
        fetch('/api/stimmkreise')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    stimmkreisInfo: data,
                });
                // Select the first Stimmkreis by default
                if (data.length) {
                    this.setSelection(data[0]);
                }
            })
    }

    // Handle user clicking to select a Stimmkreis to show
    setSelection(stimmkreis: StimmkreisInfo) {
        console.log("Setting selection", stimmkreis);
        // Update state, then tell the parent about the new selection
        this.setState({
            currSelectedID: stimmkreis.id,
        }, () => {this.props.onSelect(stimmkreis)});
    }

    render() {
        return <ListGroup>
            {this.state.stimmkreisInfo.map((info) => {
                // Set the currently-selected stimmkreis to "active"
                if (info.id === this.state.currSelectedID) {
                    return <ListGroup.Item active action onClick={() => this.setSelection(info)} key={info.number}>({info.number}) {info.name}</ListGroup.Item>
                }
                else {
                    return <ListGroup.Item action onClick={() => this.setSelection(info)} key={info.number}>({info.number}) {info.name}</ListGroup.Item>
                }

            })}
        </ListGroup>
    }
}