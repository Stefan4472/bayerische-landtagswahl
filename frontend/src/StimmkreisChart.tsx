import React from "react";
import { Pie } from '@nivo/pie'
import {Stimmkreis} from "./StimmkreisDisplayer";

interface Props {
    stimmkreis?: Stimmkreis,
}

interface State {

}

// TODO: PROVIDE OPTION TO DISPLAY ERSTSTIMMEN OR ZWEITSTIMMEN
export class StimmkreisChart extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    // Formats data for this Stimmkreis into a format that
    // can be displayed in the chart
    formatData() {
        if (this.props.stimmkreis) {
            return this.props.stimmkreis.results.map((stimmkreis) => {
                return {
                    id: stimmkreis.party,
                    value: stimmkreis.erststimmen,
                }
            })
        }
        else {
            return [];
        }
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // TODO: RESPONSIVE SIZING?
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
                colors={{'scheme': 'set3'}}
            />
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



