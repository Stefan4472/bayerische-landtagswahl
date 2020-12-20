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
            .then(data => this.setState({stimmkreisInfo: data}))
    }

    render() {
        return <ListGroup>
            {/*TODO: SET CURRENT ONE TO 'ACTIVE'*/}
            {this.state.stimmkreisInfo.map((info) =>
                <ListGroup.Item>{info.name}</ListGroup.Item>
            )}
        </ListGroup>
    }
}