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

const columns = [
    {
        field: 'date',
        headerName: 'Year',
        width: 150,
        renderCell: (params) => (
            <strong>
                {params.value.getFullYear()}
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ marginLeft: 16 }}
                >
                    Open
                </Button>
            </strong>
        ),
    },
];

export default function FlexyIncomeView(incomes) {
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
            width: 210,
        }
    ]
    const len = income.length > 7 ? 7 : income.length
    for (let i = len - 1; i > -1; i--) {
        columns.push(
            {
                field: income[i].calendarYear,
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

    let rows = []

    for (let i = 0; i < wantedMetrics.length; i++) {
        let new_row =
        {
            id: i,
            Metric: wantedMetrics[i]
        }
        for (let j = len - 1; j > -1; j--) {
            new_row[income[j].calendarYear] = {
                curr: income[j][wantedMetrics[i]],
                prev: j == len - 1 ? "" : income[j + 1][wantedMetrics[i]]
            }
        }
        rows.push(new_row)
    }

    return <DataGrid rows={rows} columns={columns} autoHeight density='compact' rowHeight={100} />


    // return (
    //     <div style={{ height: 300, width: '100%' }}>
    //         <DataGrid rows={rows} columns={columns} />
    //     </div>
    // );

    // check calendarYear
}