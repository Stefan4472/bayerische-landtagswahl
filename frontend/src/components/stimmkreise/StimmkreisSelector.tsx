import React from "react";
import {ListGroup} from "react-bootstrap";

export interface StimmkreisInfo {
    id: number;
    name: string;
    number: number;
}

interface Props {
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
        console.log('Fetching');
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

    performFilter(stimmkreise: StimmkreisInfo[], filterTerm: string|undefined) : StimmkreisInfo[] {
        console.log('Performing filter');
        // TODO: MINOR IMPROVEMENTS + MAKE IT SO THE STIMMKREIS SEARCH BAR DOESN'T SCROLL
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
        return <div>
            {/*List of Stimmkreis buttons*/}
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
        </div>
    }
}