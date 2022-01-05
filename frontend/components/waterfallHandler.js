import Plot from 'react-plotly.js';

// TODO: Split into renderer and income processing
function WaterfallTemplate(statement, year, visible) {
    const template = {
        name: year,
        visible: visible ? true : "legendonly",
        type: "waterfall",
        orientation: "v",
        number: { font: { color: 'white' } },
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

    return (
        <Plot
            data={waterfalls}
            layout={{
                title: {
                    text: "Profit and loss statement",
                    font: { color: "white" },
                },
                xaxis: {
                    color: "white",
                    type: "category"
                },
                yaxis: {
                    color: "white",
                    type: "linear",
                },
                legend: {
                    font: {
                        color: "white",
                    }
                },
                autosize: true,
                paper_bgcolor: "#1b222d",
                plot_bgcolor: "#1b222d"
            }}
        />
    );

}