import React from "react";
import { Pie } from '@nivo/pie'
import {Stimmkreis} from "./StimmkreisDisplayer";

interface PartyInfo {
    name: string;
    color: string;
}

interface Props {
    stimmkreis?: Stimmkreis,
}

interface State {
    // Map party name to hex color string
    partyColorInfo: Map<string, string>;
    // Map index to party name
    // partyOrdering: Map<, number>;
}

// TODO: PROVIDE OPTION TO DISPLAY ERSTSTIMMEN OR ZWEITSTIMMEN
export class StimmkreisChart extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            partyColorInfo: new Map(),
            // partyOrdering: [],
        };
    }

    // Make call to get data on how to display parties
    componentDidMount() {
        fetch('/api/main-parties')
            .then(response => response.json())
            .then(data => {
                // TODO: NEEDS TO BE IMPROVED
                let party_color_info = new Map<string, string>();
                let party_order_info: string[] = [];
                data.forEach((party_info: PartyInfo) => {
                    party_color_info.set(party_info.name, party_info.color);
                    party_order_info.push(party_info.name);
                })
                this.setState({
                    partyColorInfo: party_color_info,
                    partyOrdering: party_order_info,
                })
            });
    }

    // Formats data for this Stimmkreis into a format that
    // can be displayed in the chart
    formatData() {
        if (this.props.stimmkreis) {
            let results = [];
            let num_other_votes = 0;
            for (const stimmkreis of this.props.stimmkreis.results) {
                if (this.state.partyColorInfo.has(stimmkreis.party)) {
                    results.push({
                        id: stimmkreis.party,
                        value: stimmkreis.erststimmen,
                    })
                }
                // Track votes of the minor parties
                else {
                    num_other_votes += stimmkreis.erststimmen;
                }
            }
            if (num_other_votes) {
                results.push({
                    id: 'Other',
                    value: num_other_votes,
                })
            }
            console.log(results);
            return results;
        }
        else {
            return [];
        }
    }

    // Returns color for a specific party name.
    // This is pretty hacky but that's kind of Javascript's fault.
    getColor(id: string|number) : string {
        // if (id instanceof string) {
        if (typeof(id) === 'string') {
            if (this.state.partyColorInfo.has(id)) {
                let color = this.state.partyColorInfo.get(id);
                if (color) {
                    return color;
                }
            }
        }
        // Any case where we can't unambiguously resolve the color:
        // return gray
        return '#9D9D9D';
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // TODO: RESPONSIVE SIZING?
        // A link that helped me to figure out custom coloring: https://github.com/plouc/nivo/issues/581
        if (this.props.stimmkreis) {
            return <Pie
                width={400}
                height={400}
                data={this.formatData()}
                margin={{
                    top: 40,
                    right: 80,
                    bottom: 80,
                    left: 80
                }}
                innerRadius={0.43}
                enableRadialLabels={false}
                sliceLabel={'id'}
                colors={d => this.getColor(d.id)}
            />
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



