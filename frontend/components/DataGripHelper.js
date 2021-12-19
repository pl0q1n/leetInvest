export default function GetColsNRows(data, format) {
    const columns = [
        {
          field: 'metric',
          headerName: 'metric',
          width: 350
        },
        {
          field: 'value',
          headerName: 'value',
          width: 350
        }
    ]
    const rows = data.map(([name, value], idx) => {
        return {
          id: idx,
          metric: name,
          value: format(value)
        }
    })

    return [columns, rows]
}