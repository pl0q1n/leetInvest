import { DataGrid } from '@mui/x-data-grid'


// TODO: Add more items to transactions (via requesting more pages)
export default function InsiderTransactions({ transactions }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: "compact",
        compactDisplay: "short"
    })

    const columns = [
        {
            field: 'date',
            headerName: 'Date',
            width: 120
        },
        {
            field: 'type',
            headerName: 'Type',
            renderCell: (params) => {
                if (params.row.type == "P-Purchase") {
                    return <font color="green">{params.row.type}</font>
                }
                return <font color="red">{params.row.type}</font>
            },
            width: 100
        },
        {
            field: 'value',
            headerName: 'Value',
            width: 120
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 200
        },
        {
            field: 'shares',
            headerName: 'Shares',
            width: 120
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 120
        }
    ]
    const purchasesAndSales = transactions.filter((transaction) => {
        return transaction.transactionType == "P-Purchase" || transaction.transactionType == "S-Sale"
    })

    let aggregatedPurchases = []

    for (let i = 0; i < purchasesAndSales.length; i++) {
        const current = purchasesAndSales[i]
        if (aggregatedPurchases.length > 0) {
            const lastIdx = aggregatedPurchases.length - 1
            const last = aggregatedPurchases[lastIdx]
            if (last.reportingName == current.reportingName &&
                last.transactionType == current.transactionType &&
                last.date == current.date) {
                aggregatedPurchases[lastIdx].securitiesTransacted += current.securitiesTransacted
                aggregatedPurchases[lastIdx].value += current.securitiesTransacted * current.price
            }
            else {
                aggregatedPurchases.push(current)
                aggregatedPurchases[lastIdx + 1].value = current.securitiesTransacted * current.price
            }
        }
        else {
            aggregatedPurchases.push(current)
            aggregatedPurchases[0].value = current.securitiesTransacted * current.price
        }
    }

    const rows = aggregatedPurchases.map((it, id) => {
        return {
            id: id,
            date: it.transactionDate,
            type: it.transactionType,
            value: formatter.format(it.value),
            name: it.reportingName,
            shares: it.securitiesTransacted,
            price: (it.value / it.securitiesTransacted).toFixed(1)
        }
    })
    return <DataGrid rows={rows} columns={columns} autoHeight density='compact' />
}