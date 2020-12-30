import React from "react";
import { ResponsivePie } from '@nivo/pie'
import {Stimmkreis} from "./StimmkreisDisplayer";
import assert from "assert";

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
    partyOrdering: string[];
}

// TODO: PROVIDE OPTION TO DISPLAY ERSTSTIMMEN OR ZWEITSTIMMEN
export class StimmkreisChart extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            partyColorInfo: new Map(),
            partyOrdering: [],
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
    // can be displayed in the chart.
    // NOTE: This is pretty hacky.
    formatData() {
        if (this.props.stimmkreis) {
            // Construct result object mapped by party name
            let results = new Map<string, any>();
            // Create result objects for the main parties
            let num_other_votes = 0;
            for (const stimmkreis of this.props.stimmkreis.results) {
                if (this.state.partyColorInfo.has(stimmkreis.party_name)) {
                    results.set(stimmkreis.party_name, {
                        id: stimmkreis.party_name,
                        value: stimmkreis.erst_stimmen,
                    })
                }
                // Track votes of the minor parties
                else {
                    num_other_votes += stimmkreis.erst_stimmen;
                }
            }
            // Now order result objects into a list
            let results_list = [];
            for (const party_name of this.state.partyOrdering) {
                if (results.has(party_name)) {
                    results_list.push(results.get(party_name));
                }
                else {
                    // SHOULD NEVER HAPPEN
                    assert(false);
                }
            }
            // Add the sum of all tiny parties
            if (num_other_votes) {
                results_list.push({
                    id: 'Other',
                    value: num_other_votes,
                })
            }
            return results_list;
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
        return '#b0bec5 ';
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // TODO: RESPONSIVE SIZING?
        // A link that helped me to figure out custom coloring: https://github.com/plouc/nivo/issues/581
        if (this.props.stimmkreis) {
            return (
                <div style={{"height": "400px"}}>
                    <ResponsivePie
                        data={this.formatData()}
                        innerRadius={0.43}
                        enableRadialLabels={false}
                        sliceLabel={'id'}
                        // colors={{"scheme": "pastel1"}}
                        colors={d => this.getColor(d.id)}
                        legends={[
                            {
                                anchor: 'top-left',
                                direction: 'column',
                                justify: false,
                                translateX: 0,
                                translateY: 0,
                                itemWidth: 100,
                                itemHeight: 20,
                                itemsSpacing: 0,
                                symbolSize: 20,
                                itemDirection: 'left-to-right',
                                symbolShape: 'circle'
                            }
                        ]}
                    />
                </div>
            )
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



