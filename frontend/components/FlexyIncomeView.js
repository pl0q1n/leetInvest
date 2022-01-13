import DiffTable from './DiffTableView';

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
                width: 150,
            }
        )
    }

    // we need to push TTM manually
    columns.push(
        {
            field: "TTM",
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
        let newRow = {
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

    return <DiffTable rows={rows} columns={columns}/>
}