import Plot from 'react-plotly.js';

export default function WaterfallHandler(props) {
    console.log("ALLLOOOO")
    console.log(props)
    return (
        <Plot
            data={[
                {
                    name: "2022",
                    type: "waterfall",
                    orientation: "v",
                    measure: [
                        "relative",
                        "relative",
                        "total",
                        "relative",
                        "total"
                    ],
                    x: [
                        "Revenue",
                        "Cost of Revenue",
                        "Gross Profit",
                        "Expenses",
                        "Earnings"
                    ],
                    textposition: "outside",
                    // text: [
                    //     "$176",
                    //     "$-54",
                    //     "$121",
                    //     "$-53",
                    //     "$67"
                    // ],
                    y: [
                        props.revenue,
                        -props.costOfRevenue,
                        props.grossProfit,
                        -props.operatingExpenses,
                        props.netIncome
                    ],
                    connector: {
                        line: {
                            color: "rgb(63, 63, 63)"
                        }
                    },
                },
                
            ]}

            layout={{
                title: {
                    text: "Profit and loss statement"
                },
                xaxis: {
                    type: "category"
                },
                yaxis: {
                    type: "linear"
                },
                autosize: true,
                showlegend: true
            }}
        />
    );

}