import React from "react";
import {Col, Form, ListGroup} from "react-bootstrap";

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
    displayedStimmkreise: StimmkreisInfo[];
    // currFilter: string;
}

export class StimmkreisSelector extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            stimmkreisInfo: [],
            displayedStimmkreise: [],
            // currFilter: '',
        };
    }

    componentDidMount() {
        fetch('/api/stimmkreise')
            .then(response => response.json())
            .then(data => {
                // NOTE: THIS ASSUMES THAT THERE IS NO FILTER ENTERED
                this.setState({
                    stimmkreisInfo: data,
                    displayedStimmkreise: this.performFilter(data, ''),
                });
                // Select the first Stimmkreis by default
                if (data.length) {
                    this.setSelection(data[0]);
                }
            })
    }

    performFilter(stimmkreise: StimmkreisInfo[], filterTerm: string) : StimmkreisInfo[] {
        console.log('Filtering by ', filterTerm);
        if (filterTerm === '') {
            return stimmkreise;
        }

        // TODO: USE JAVASCRIPT FILTER() METHOD
        let filtered_stimmkreise: StimmkreisInfo[] = [];
        for (const stimmkreis of stimmkreise) {
            if (stimmkreis.name.startsWith(filterTerm)) {
                filtered_stimmkreise.push(stimmkreis);
            }
            else if (stimmkreis.number.toString().startsWith(filterTerm)) {
                filtered_stimmkreise.push(stimmkreis);
            }
        }
        return filtered_stimmkreise;
    }

    // Handle user changing entry in the Stimmkreis search bar
    onSearchChanged(newTerm: string) {
        console.log('New term set to ', newTerm);
        this.setState({
            displayedStimmkreise: this.performFilter(this.state.stimmkreisInfo, newTerm),
        });
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
        return <div>
            {/*Search form*/}
            <Form>
              <Form.Control className={'my-2'} type="text" placeholder="Search" onChange={(event) => {this.onSearchChanged(event.target.value);}}/>
            </Form>
            {/*List of Stimmkreis buttons*/}
            <ListGroup>
                {this.state.displayedStimmkreise.map((info) => {
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