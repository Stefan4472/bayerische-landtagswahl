import React from "react";
import { Pie } from '@nivo/pie'


interface Props {

}

interface State {
    sitzVerteilung: Map<string, number>,
}

export class SitzverteilungChart extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            sitzVerteilung: new Map(),
        };
    }

    componentDidMount() {
        fetch('/api/results/sitzverteilung')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    sitzVerteilung: new Map(Object.entries(data)),
                })
            });
    }

    formatData() {
        let data: { id: string; value: number; }[] = [];
        this.state.sitzVerteilung.forEach(function(value, key) {
            data.push({
                id: key,
                value: value,
            });
        });
        return data;
    }

    render() {
        // TODO: TOOLTIP SHOULD SHOW WELL-FORMATTED NUMBER AND PERCENT
        // TODO: RESPONSIVE SIZING?
        // TODO: MAKE IT LOOK LIKE THE EXAMPLE PROVIDED BY NIVO
        // A link that helped me to figure out custom coloring: https://github.com/plouc/nivo/issues/581
        if (this.state.sitzVerteilung) {
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
                innerRadius={0.5}
                enableRadialLabels={false}
                sliceLabel={'id'}
                startAngle={-90}
                endAngle={90}
            />
        }
        else {
            // TODO: WHAT TO RETURN?
            return <div></div>;
        }
    }
}



