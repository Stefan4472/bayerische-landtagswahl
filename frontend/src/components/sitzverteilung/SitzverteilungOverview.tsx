import React from "react";
import {SitzverteilungChart} from "./SitzverteilungChart";
import {SitzverteilungTable} from "./SitzverteilungTable";
import {Card} from "react-bootstrap";
import SitzverteilungEndpoints from "../../rest_client/SitzverteilungEndpoints";

interface Props {

}

interface State {
    // TODO: USE LIST INSTEAD
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
        SitzverteilungEndpoints.getAll().then(data => {
            // Transform list into Map
            // TODO: JUST USE A LIST
            this.setState({
                sitzVerteilung: new Map(
                    data.map(rec => [rec.party_name, rec.num_seats])
                ),
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



