import Plot from 'react-plotly.js';

export default function IncomePlotView({ income, estimates }) {
    const len = income.length > 5 ? 5 : income.length
    const histYears = income.slice(0, len).map((inc) => inc.date.substring(0, 4))
    const estimatesCutoff = histYears[0]

    const estimatesYears = estimates.map((e) => e.date.substring(0, 4)).reverse()

    const revenue = income.slice(0, len).map((inc) => inc.revenue)
    const earnings = income.slice(0, len).map((inc) => inc.netIncome)

    const estimatedAvgRevenue = [revenue[0]].concat(
        estimates.map((e) => e.estimatedRevenueAvg).reverse()
    )

    const estimatedAvgEarnings = [earnings[0]].concat(
        estimates.map((e) => e.estimatedNetIncomeAvg).reverse()
    )

    const estimatedMaxRevenue = estimates.map((e) => e.estimatedRevenueHigh).reverse()
    const estimatedMinRevenue = estimates.map((e) => e.estimatedRevenueLow).reverse()

    const estimatedMaxEarnings = estimates.map((e) => e.estimatedNetIncomeHigh).reverse()
    const estimatedMinEarnings = estimates.map((e) => e.estimatedNetIncomeLow).reverse()

    const revenueData = {
        line: {
            width: 5
        },
        name: 'revenue',
        x: histYears,
        y: revenue,
        mode: 'lines'
    }

    const earningsData = {
        line: {
            width: 5
        },
        name: 'earnings',
        x: histYears,
        y: earnings,
        mode: 'lines'
    }

    const estimatedMinMaxRevenueData = {
        line: {
            color: 'transparent'
        },
        name: 'estimated revenue (min/max)',
        fill: 'toself',
        fillcolor: 'rgba(0,176,246,0.2)',
        x: estimatesYears.concat([...estimatesYears].reverse()),
        y: estimatedMaxRevenue.concat([...estimatedMinRevenue].reverse()),
        showlegend: false,
        type: 'scatter'
    }

    const estimatedMinMaxEarningsData = {
        line: {
            color: 'transparent'
        },
        name: 'estimated earnings (min/max)',
        fill: 'toself',
        fillcolor: 'rgba(0,177,246,0.2)',
        x: estimatesYears.concat([...estimatesYears].reverse()),
        y: estimatedMaxEarnings.concat([...estimatedMinEarnings].reverse()),
        showlegend: false,
        type: 'scatter'
    }

    const estimatedAvgRevenueData = {
        line: {
            dash: 'dashdot',
            width: 5,
        },
        name: 'estimated revenue',
        x: [estimatesCutoff].concat(estimatesYears),
        y: estimatedAvgRevenue,
        mode: 'lines'
    }

    const estimatedAvgEarningsData = {
        line: {
            dash: 'dashdot',
            width: 5,
        },
        name: 'estimated earnings',
        x: [estimatesCutoff].concat(estimatesYears),
        y: estimatedAvgEarnings,
        mode: 'lines'
    }

    return (
        <Plot
            data={[
                revenueData,
                earningsData,
                estimatedAvgRevenueData,
                estimatedAvgEarningsData,
                estimatedMinMaxRevenueData,
                estimatedMinMaxEarningsData
            ]}
            layout={{
                title: {
                    text: "Earnings and Revenue Growth Forecasts",
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
                    zeroline: false
                },
                yaxis: {
                    color: "white",
                    autorange: true,
                    rangemode: 'tozero',
                    zeroline: false,
                },
                hovermode: 'x',
                shapes: [
                    {
                        type: 'line',
                        yref: 'paper',
                        x0: estimatesCutoff,
                        y0: 0,
                        x1: estimatesCutoff,
                        y1: 1,
                        line: {
                            color: `grey`,
                            width: 3,
                        }
                    }
                ],
            }}
        />
    )
}