import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';



export default function Search({changeQuery}) {
    
    const [query, SetQuery] = React.useState()
    console.log(changeQuery)
    
    const handleChange = (e) => SetQuery(e.target.value)
    return (
    <Stack spacing={2} direction="row" alignItems="center" >
        <TextField id="outlined-search" label="Ticker Search" type="search" onChange={handleChange} />
        <Button variant="outlined" 
                size="large" 
                onClick={() => 
                {
                    changeQuery(query);
                }}
        >Search</Button>
      </Stack>
    )
}