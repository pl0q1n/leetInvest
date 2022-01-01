import {Container, Paper, Typography} from '@mui/material'

export default function CompanyOverview({data}) {
    return (
        <>
            <Paper elevation={0} paragraph={true}>
                <img src={data.image}/>
                <Typography variant='body1' sx={{ ml: 5, mt: 5, mb: 5, mr: 5 }}>
                    {data.description}
                </Typography>
            </Paper>
        </>
    )
}