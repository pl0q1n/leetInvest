import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'


const wantedMetrics =
    [
        "revenue",
        "costOfRevenue",
        "grossProfit",
        "researchAndDevelopmentExpenses",
        "sellingGeneralAndAdministrativeExpenses",
        "operatingExpenses",
        "costAndExpenses",
        "interestIncome",
        "interestExpense",
        "depreciationAndAmortization",
        "ebitda",
        "operatingIncome",
        "totalOtherIncomeExpensesNet",
        "incomeBeforeTax",
        "netIncome"
    ]

export default function FlexyIncomeView({incomeAnnual, incomeQuarter}) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: "compact",
        compactDisplay: "short"
    })

    let columns = [
        {
            field: 'Metric',
            width: 210,
        }
    ]

    const len = incomeAnnual.length > 7 ? 7 : incomeAnnual.length

    for (let i = len - 1; i > -1; i--) {
        columns.push(
            {
                field: incomeAnnual[i].calendarYear,
                renderCell: (params) => {
                    const diff = params.value.prev == "" ? "" : (params.value.curr / params.value.prev * 100) - 100
                    const diff_comp = (() => {
                        if (diff == "") {
                            return diff
                        }

                        const color = diff > 0 ? "green" : "red"
                        return <font color={color}>{diff.toFixed(2)+"%"}</font>
                    })()
                    return (
                        <Typography>
                            {formatter.format(params.value.curr)}
                            <br></br>
                            {diff_comp}
                        </Typography>
                    )
                },
                width: 150,
            }
        )
    }

    // we need to push TTM manually
    columns.push(
        {
            field: "TTM",
            renderCell: (params) => {
                const diff = params.value.prev == "" ? "" : (params.value.curr / params.value.prev * 100) - 100
                const diff_comp = (() => {
                    if (diff == "") {
                        return diff
                    }

                    const color = diff > 0 ? "green" : "red"
                    return <font color={color}>{diff.toFixed(2)+"%"}</font>
                })()
                return (
                    <Typography>
                        {formatter.format(params.value.curr)}
                        <br></br>
                        {diff_comp}
                    </Typography>
                )
            },
            width: 150,
        }
    )

    let ttm = {...incomeQuarter[0]}
    incomeQuarter.slice(1,4).map((inc) => {
        for (let i = 0; i < wantedMetrics.length; i++) {
            ttm[wantedMetrics[i]] += inc[wantedMetrics[i]]
        }
    })

    let rows = []
    for (let i = 0; i < wantedMetrics.length; i++) {
        let newRow =
        {
            id: i,
            Metric: wantedMetrics[i]
        }
        for (let j = len - 1; j > -1; j--) {
            newRow[incomeAnnual[j].calendarYear] = {
                curr: incomeAnnual[j][wantedMetrics[i]],
                prev: j == len - 1 ? "" : incomeAnnual[j + 1][wantedMetrics[i]]
            }
        }
        newRow["TTM"] = {
            curr: ttm[wantedMetrics[i]],
            prev: incomeAnnual[0][wantedMetrics[i]]
        }
        rows.push(newRow)
    }

    return <DataGrid rows={rows} columns={columns} autoHeight density='compact' rowHeight={100} />
}