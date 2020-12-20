import React from "react";
import {ListGroup} from "react-bootstrap";

interface StimmkreisInfo {
    id: number;
    name: string;
    number: number;
}

interface Props {

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
                    this.setState({
                        currSelectedID: data[0].id,
                    })
                }
            })
    }

    // Handle user clicking to select a Stimmkreis to show
    handleStimmkreisClick(stimmkreis: StimmkreisInfo) {
        console.log(stimmkreis);
        this.setState({
            currSelectedID: stimmkreis.id,
        });
    }

    render() {
        return <ListGroup>
            {this.state.stimmkreisInfo.map((info) => {
                // Set the currently-selected stimmkreis to "active"
                if (info.id === this.state.currSelectedID) {
                    return <ListGroup.Item active action onClick={() => this.handleStimmkreisClick(info)}>({info.number}) {info.name}</ListGroup.Item>
                }
                else {
                    return <ListGroup.Item action onClick={() => this.handleStimmkreisClick(info)}>({info.number}) {info.name}</ListGroup.Item>
                }

            })}
        </ListGroup>
    }
}