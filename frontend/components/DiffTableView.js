import { DataGrid } from "@mui/x-data-grid"
import { Typography } from "@mui/material"

export default function DiffTable({rows, columns}) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: "compact",
        compactDisplay: "short"
    })

    const renderCell = (params) => {
        if (typeof(params.value) == 'string') {
            return <Typography> {params.value} </Typography>
        }

        const {curr, prev} = params.value
        const diff = prev == "" ? "-" : Math.abs((curr / prev) * 100 - 100)

        const displayDiff = (diff) => {
            if (typeof(diff) == "string") {
                return diff
            }
            let color = "grey"
            if (curr > prev) {
                color = "green"
            }
            else if (curr < prev) {
                color = "red"
                diff = -diff
            }
            return <font color={color}>{diff.toFixed(2)+"%"}</font>
        }

        return (
            <Typography>
                {formatter.format(curr)}
                <br></br>
                {displayDiff(diff)}
            </Typography>
        )
    }

    for (const column of columns) {
        column.renderCell = renderCell
    }

    return <DataGrid rows={rows} columns={columns} autoHeight density='compact' rowHeight={100} />
}