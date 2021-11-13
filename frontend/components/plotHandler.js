import Plot from 'react-plotly.js';
import {useState} from 'react'


export default function PlotHandler(props) {
    const [showHover, setShowHover] = useState(false)
    const params = props
    const price = params.price
    const dcf = params.dcf
    const right_border = Math.max(price, dcf*1.5)
    var format = 'nah'

    if (dcf >= price) {
        format = `Stock price ${price} is undervalued by it's fair price of ${dcf}`
    } else {
        format = `Stock price ${price} is overvalued by it's fair price of ${dcf}`
    }

    console.log("Damn boy check this out: %f %f", price, dcf)
    return (
        // <div>
        <Plot
        data={[
          { 
            delta: { reference: dcf, decreasing:{ color: "green"}, increasing: {color: "red"}},
            value: price,
            number: { prefix: "$"},
            type: 'indicator',
            mode: 'number+gauge+delta',
            text: [format],
            gauge: {
                shape: "bullet",
                axis: { range: [null, right_border] },
                bgcolor: "white",
                steps: [{ range: [0, dcf], color: "cyan" },
                        { range: [dcf, dcf * 1.25], color: "orange"},
                        { range: [dcf*1.25, right_border], color: "red"}],
                bar: { color: "black" }
              }
          },
        ]}

        layout={ {width: 600, height: 220, title: 'Fair value'} }
        onHover={(e) => {
            console.log("XUI")
            setShowHover(!showHover)
        }}
      />
    //   {showHover&&<div>HUI</div>}
    //   </div>
    );

}