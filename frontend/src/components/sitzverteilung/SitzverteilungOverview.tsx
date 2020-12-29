import React from "react";
import {SitzverteilungChart} from "./SitzverteilungChart";
import {SitzverteilungTable} from "./SitzverteilungTable";
import {Card} from "react-bootstrap";

interface Props {

}

interface State {
    sitzVerteilung: Map<string, number>,
}

export class SitzverteilungOverview extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            sitzVerteilung: new Map(),
        };
    }

    componentDidMount() {
        fetch('/api/results/sitzverteilung')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    sitzVerteilung: new Map(Object.entries(data)),
                })
            });
    }

    render() {
        if (this.state.sitzVerteilung) {
            return (
                <div>
                    <Card>
                        <Card.Body>
                            <SitzverteilungChart sitzVerteilung={this.state.sitzVerteilung}/>
                        </Card.Body>
                    </Card>
                    <div className={"my-1"}/>
                    <SitzverteilungTable sitzVerteilung={this.state.sitzVerteilung}/>
                </div>
            )
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



