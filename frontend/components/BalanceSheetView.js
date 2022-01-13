import DiffTable from './DiffTableView';

const fieldNames = [
    'cashAndShortTermInvestments',
    'inventory',
    'totalCurrentAssets',
    'longTermInvestments',
    'totalNonCurrentAssets',
    'totalAssets',
    'shortTermDebt',
    'longTermDebt',
    'totalCurrentLiabilities',
    'totalNonCurrentLiabilities',
    'totalLiabilities',
    'commonStock', // FIXME: not in dollars
    'retainedEarnings',
    'totalStockholdersEquity',
    'totalEquity',
    'totalInvestments',
    'totalDebt',
    'netDebt'
]

export default function BalanceSheetView({balanceAnnual, balanceQuarter}) {
    let columns = [
        {
            field: 'Metric',
            width: 210,
        }
    ]

    const len = balanceAnnual.length > 7 ? 7 : balanceAnnual.length
    for (let i = len - 1; i > -1; i--) {
        columns.push(
            {
                field: balanceAnnual[i].calendarYear,
                width: 150,
            }
        )
    }

    columns.push(
        {
            field: "LastQuarter",
            width: 150,
        }
    )

    const ttm = {...balanceQuarter[0]}
    let rows = []
    for (let i = 0; i < fieldNames.length; i++) {
        let newRow = {
            id: i,
            Metric: fieldNames[i]
        }
        for (let j = len - 1; j > -1; j--) {
            newRow[balanceAnnual[j].calendarYear] = {
                curr: balanceAnnual[j][fieldNames[i]],
                prev: j == len - 1 ? "" : balanceAnnual[j + 1][fieldNames[i]]
            }
        }
        newRow["LastQuarter"] = {
            curr: ttm[fieldNames[i]],
            prev: balanceAnnual[0][fieldNames[i]]
        }
        rows.push(newRow)
    }

    return <DiffTable rows={rows} columns={columns}/>
}