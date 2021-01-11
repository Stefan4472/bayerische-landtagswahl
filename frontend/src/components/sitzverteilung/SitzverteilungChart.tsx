import React from "react";
import { ResponsivePie } from '@nivo/pie'
import {SitzVerteilung} from "../../rest_client/SitzverteilungEndpoints";


interface Props {
    sitzVerteilung: SitzVerteilung[],
}

export class SitzverteilungChart extends React.Component<Props> {
    formatData(sitzVerteilung: SitzVerteilung[]) : { id: string; value: number; }[] {
        return sitzVerteilung.map((sitz_verteilung) => {
           return {
               id: sitz_verteilung.party_name,
               value: sitz_verteilung.num_seats,
           }
        });
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // A link that helped me to figure out custom coloring: https://github.com/plouc/nivo/issues/581
        return (
            <div style={{"height": "400px"}}>
                <ResponsivePie
                    data={this.formatData(this.props.sitzVerteilung)}
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



