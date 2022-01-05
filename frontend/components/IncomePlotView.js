import Plot from 'react-plotly.js';

export default function IncomePlotView({ income }) {
    const len = income.length > 5 ? 5 : income.length
    const years = income.slice(0, len).map((inc, i) => {
        const date = inc.date.substring(0, 4)
        return date
    })
    const revenue = income.slice(0, len).map((inc, i) => {
        return inc.revenue
    })
    const earnings = income.slice(0, len).map((inc, i) => {
        return inc.netIncome
    })

    const revenue_data = {
        line: {
            width: 5
        },
        name: 'revenue',
        x: years,
        y: revenue,
        mode: 'lines'

    }
    const earnings_data = {
        line: {
            width: 5
        },
        name: 'earnings',
        x: years,
        y: earnings,
        mode: 'lines'
    }


    return (
        <Plot
            data={[revenue_data, earnings_data]}
            layout={{
                title: {
                    text: "Revenue and Earnings",
                    font: { color: "white" },
                },
                legend: {
                    font: { color: "white" },
                },
                width: 1000, // Unhardcode values to responsive parential style
                height: 600,
                showticklabels: true,
                paper_bgcolor: "#1b222d",
                plot_bgcolor: "#1b222d",
                xaxis: {
                    color: "white",
                    autorange: true,
                    type: 'date',
                },
                yaxis: {
                    color: "white",
                    autorange: true,
                    rangemode: 'tozero',
                },
                hovermode: 'x',
            }}
        />
    )
}