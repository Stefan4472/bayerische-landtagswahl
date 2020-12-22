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
    partyColorInfo: Map<string, string>;
}

// TODO: PROVIDE OPTION TO DISPLAY ERSTSTIMMEN OR ZWEITSTIMMEN
export class StimmkreisChart extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            partyColorInfo: new Map(),
        };
    }

    // Make call to get data on how to display parties
    componentDidMount() {
        fetch('/api/main-parties')
            .then(response => response.json())
            .then(data => {
                // TODO: NEEDS TO BE IMPROVED
                let party_color_info = new Map<string, string>();
                data.forEach((obj: PartyInfo) => {
                    console.log(obj);
                    console.log(obj.name, obj.color);
                    party_color_info.set(obj.name, obj.color);
                })
                this.setState({
                    partyColorInfo: party_color_info,
                })
            });
    }

    // Formats data for this Stimmkreis into a format that
    // can be displayed in the chart
    formatData() {
        if (this.props.stimmkreis) {
            return this.props.stimmkreis.results.map((stimmkreis) => {
                return {
                    id: stimmkreis.party,
                    value: stimmkreis.erststimmen,
                    color: '#FFFFFF',
                }
            })
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
            console.log(id);
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
            let func = this.getColor;
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



