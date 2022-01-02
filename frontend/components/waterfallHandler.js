import Plot from 'react-plotly.js';

// TODO: Split into renderer and income processing
function WaterfallTemplate(statement, year, visible) {
    const template = {
        name: year,
        visible: visible ? true : "legendonly", 
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
        y: [
            statement.revenue,
            -statement.costOfRevenue,
            statement.grossProfit,
            -statement.operatingExpenses,
            statement.netIncome
        ],
        connector: {
            line: {
                color: "rgb(63, 63, 63)",
                mode: "spanning"
            }
        },
    }

    return template
}

export default function WaterfallHandler(props) {
    const waterfalls = props.income.map((inc, i) => {
        const date = inc.date.substring(0,4)
        return WaterfallTemplate(inc, date, i == 0)
    })


    const obj = WaterfallTemplate(props.income, 2022)
    return (
        <Plot
            data={waterfalls}
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
                paper_bgcolor: "#1b222d",
                plot_bgcolor: "#1b222d"
            }}
        />
    );

}