import DiffTable from './DiffTableView';

const wantedMetrics =
    [
        "netIncome",
        "depreciationAndAmortization",
        "deferredIncomeTax",
        "stockBasedCompensation",
        "changeInWorkingCapital",
        "accountsReceivables",
        "accountsPayables",
        "investmentsInPropertyPlantAndEquipment",
        "effectOfForexChangesOnCash",
        "netChangeInCash",
        "operatingCashFlow",
        "capitalExpenditure",
        "freeCashFlow"
    ]

export default function CashFlowView({cashFlowAnnual, cashFlowQuarter}) {
    let columns = [
        {
            field: 'Metric',
            width: 210,
        }
    ]

    const len = cashFlowAnnual.length > 7 ? 7 : cashFlowAnnual.length
    for (let i = len - 1; i > -1; i--) {
        columns.push(
            {
                field: cashFlowAnnual[i].calendarYear,
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

    let ttm = {...cashFlowQuarter[0]}
    cashFlowQuarter.slice(1,4).map((inc) => {
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
            newRow[cashFlowAnnual[j].calendarYear] = {
                curr: cashFlowAnnual[j][wantedMetrics[i]],
                prev: j == len - 1 ? "" : cashFlowAnnual[j + 1][wantedMetrics[i]]
            }
        }
        newRow["TTM"] = {
            curr: ttm[wantedMetrics[i]],
            prev: cashFlowAnnual[0][wantedMetrics[i]]
        }
        rows.push(newRow)
    }

    return <DiffTable rows={rows} columns={columns}/>
}