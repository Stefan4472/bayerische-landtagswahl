import React from "react";
import { ResponsivePie } from '@nivo/pie'
import {Stimmkreis} from "../../rest_client/StimmkreisEndpoints";
import {MAIN_PARTIES, MAIN_PARTY_COLORS} from "../../PartyDisplay";

interface PartyInfo {
    name: string;
    color: string;
}

interface Props {
    stimmkreis?: Stimmkreis,
}

// TODO: PROVIDE OPTION TO DISPLAY ERSTSTIMMEN OR ZWEITSTIMMEN
export class StimmkreisChart extends React.Component<Props> {

    // party_name: string;
    // candidate_fname: string;
    // candidate_lname: string;
    // erst_stimmen: number;
    // gesamt_stimmen: number;
    //
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
                if (MAIN_PARTIES.has(stimmkreis.party_name)) {
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
            MAIN_PARTIES.forEach((party_name) => {
                if (results.has(party_name)) {
                    results_list.push(results.get(party_name));
                }
            });
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
        if (typeof(id) === 'string') {
            if (MAIN_PARTY_COLORS.has(id)) {
                let color = MAIN_PARTY_COLORS.get(id);
                if (color) {
                    return color;
                }
            }
        }
        // Any case where we can't unambiguously resolve the color:
        // return gray
        return '#b0bec5';
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // A link that helped me to figure out custom coloring: https://github.com/plouc/nivo/issues/581
        return (
            <div style={{"height": "400px"}}>
                <ResponsivePie
                    data={this.formatData()}
                    innerRadius={0.43}
                    enableRadialLabels={false}
                    sliceLabel={'id'}
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
}



