import React from "react";
import { ResponsivePie } from '@nivo/pie'


interface Props {
    sitzVerteilung: Map<string, number>,
}

interface State {

}

export class SitzverteilungChart extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    formatData() : { id: string; value: number; }[] {
        let data: { id: string; value: number; }[] = [];
        this.props.sitzVerteilung.forEach(function(value, key) {
            data.push({
                id: key,
                value: value,
            });
        });
        return data;
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // A link that helped me to figure out custom coloring: https://github.com/plouc/nivo/issues/581
        return (
            <div style={{"height": "400px"}}>
                <ResponsivePie
                    data={this.formatData()}
                    innerRadius={0.5}
                    enableRadialLabels={false}
                    sliceLabel={'id'}
                    startAngle={-90}
                    endAngle={90}
                    padAngle={0.5}
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



