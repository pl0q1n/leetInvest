import Plot from "react-plotly.js"

const GaugeHandler = ({ value, min, max }) => {
    return (
        <Plot data={[
            {
                type: "indicator",
                value: value,
                number: { prefix: "$", font: { color: 'white' } },
                delta: {
                    reference: 30,
                    increasing: {
                        color: "red"
                    },
                    decreasing: {
                        color: "green"
                    },
                },
                gauge: { axis: { visible: false, range: [min, Math.max(max, value)] } },
            }]}
            layout={{
                width: 200,
                height: 200,
                margin: { t: 25, b: 25, l: 25, r: 25 },
                paper_bgcolor: "#1b222d",
                plot_bgcolor: "#1b222d",
                template: {
                    data: {
                        indicator: [
                            {
                                title: {
                                    text: "P/E",
                                    font: { color: "white" }
                                },
                                mode: "number+delta+gauge",
                            }
                        ]
                    }
                }
            }}
        />
    )
}

export default GaugeHandler