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

export default function IncomeView(incomes) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD',     
        notation: "compact",
        compactDisplay: "short" 
      })

    const income = incomes.incomes
    let columns = [
        {
          field: 'Metric',
        }
    ]
    const len = income.length > 7 ? 7 : income.length
    for (let i = len-1; i > -1; i--) {
        columns.push(
            {
                field: income[i].calendarYear,
            } 
        )
    }

    let rows = []

    for (let i = 0; i < wantedMetrics.length; i++) {
        let new_row = 
        {
            id: i,
            Metric: wantedMetrics[i]
        }
        for (let j = len-1; j > -1; j--) {
            new_row[income[j].calendarYear] =  formatter.format(income[j][wantedMetrics[i]])
        }
        rows.push(new_row)
    }

    return <DataGrid columns={columns} rows={rows} autoHeight density='compact' />
    // check calendarYear
}