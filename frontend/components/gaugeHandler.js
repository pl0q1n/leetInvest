import Gauge from 'react-gaugejs';

export default function GaugeHandler(props) {
    console.log(props)

    const diff = (props.max - props.min) / 5
    let labels = [props.min]
    for (let i = 1; i < 6; i++) {
        labels.push(labels[i-1] + diff)
    }
    // for some reasons gauge js is ignoring provided labels
    console.log(labels)
    
    return (
        <Gauge
        value={props.pe}
        minValue={props.min}
        maxValue={props.max}
        animationSpeed={32}
        options={{
            angle: 0.1,
            lineWidth: 0.1,
            radiusScale: 1,
            pointer: {
                length: 0.5, // // Relative to gauge radius
                strokeWidth: 0.035, // The thickness
                color: '#000000' // Fill color
            },
            limitMax: false,
            limitMin: false,
            colorStart: '#6F6EA0',
            colorStop: '#C0C0DB',
            strokeColor: '#EEEEEE',
            generateGradient: true,
            highDpiSupport: true,
            percentColors: [ [0, "#4bef0c"], [0.25, "#bcef0c" ], [0.50, "#f9c802"], [0.75, "#f94d02"], [1.0, "#ff0000"]],
            staticLabels: {
                font: "10px sans-serif",  // Specifies font
                labels: [0, 10, 20, 30, 40, 50],  // Print labels at these values
                color: "#000000",  // Optional: Label text color
                fractionDigits: 0  // Optional: Numerical precision. 0=round off.
              },
              renderTicks: {
                divisions: 5,
                divWidth: 1.1,
                divLength: 0.7,
                divColor: "#333333",
                subDivisions: 3,
                subLength: 0.5,
                subWidth: 0.6,
                subColor: "#666666"
              }
        }}
        // any other props are passed through to the canvas element
        
        className='gauge-canvas'
        style={{height: '150px'}}
    />
    )
}