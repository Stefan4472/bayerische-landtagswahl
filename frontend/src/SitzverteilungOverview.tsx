import React from "react";
import {SitzverteilungChart} from "./SitzverteilungChart";

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
            return <SitzverteilungChart sitzVerteilung={this.state.sitzVerteilung}/>
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



