import Plot from 'react-plotly.js';
import { useState } from 'react'

export default function PlotHandler(props) {
  const [showHover, setShowHover] = useState(false)
  const params = props
  const price = params.price
  const dcf = params.dcf
  const right_border = Math.max(price, dcf * 1.5)

  let format = `Stock price ${price} is overvalued by it's fair price of ${dcf}`
  if (dcf >= price) {
    format = `Stock price ${price} is undervalued by it's fair price of ${dcf}`
  }

  return (
    <div>
    <Plot
      data={[
        {
          delta: { reference: dcf, decreasing: { color: "green" }, increasing: { color: "red" } },
          value: price,
          number: { prefix: "$", font: {color: 'white'} },
          type: 'indicator',
          mode: 'number+gauge+delta',
          text: [format],
          gauge: {
            shape: "bullet",
            axis: { range: [null, right_border], tickcolor: "white", tickfont: {color: "white"} },
            steps: [{ range: [0, dcf], color: "#2dc97e" },
            { range: [dcf, dcf * 1.25], color: "#ffc701" },
            { range: [dcf * 1.25, right_border], color: "#e64141" }],
            bar: { color: "black", opacity: 0.5 }
          }
        },
      ]}

      layout={{ width: 600, height: 220, title: {text: 'Fair value', font: {color: 'white'}},  paper_bgcolor: '#1b222d'}}
    />
    </div>
  );

}