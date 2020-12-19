import React from "react";


interface Props {
    
}

interface State {
    
}

export class TestComp extends React.Component<Props> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        // callAPI().then(result => {
        //     console.log(result);
        // }
        fetch('/api')
            .then(response => response.json())
            .then(data => console.log(data))
    }

    render() {
        return <div>Test</div>
    }
}