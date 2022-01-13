import * as React from 'react';
import { Stack, Button, TextField } from '@mui/material'

export default function Search({ changeQuery }) {
    const [query, SetQuery] = React.useState()
    const handleChange = (e) => SetQuery(e.target.value)
    return (
        <Stack spacing={2} direction="row" alignItems="center" >
            <form onSubmit={(e) => {
                e.preventDefault()
                changeQuery(query)
            }}>
                <TextField
                    id="outlined-search"
                    label="Ticker Search"
                    type="search"
                    size="medium"
                    onChange={handleChange} />
                <Button variant="outlined"
                    // size="large"
                    style={{
                        minHeight: '56px',
                        maxHeight: '56px',
                    }}
                    onClick={() => {
                        changeQuery(query);
                    }}
                >Search</Button>
            </form>
        </Stack>
    )
}