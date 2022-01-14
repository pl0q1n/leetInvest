import {Paper, Typography} from '@mui/material'
import styles from '../styles/Home.module.css'

export default function CompanyOverview({data}) {
    return (
        <>
            <Paper elevation={0} paragraph={true}>
                <img src={data.image}  className={styles.center}/>
                <Typography variant='body1' sx={{ ml: 5, mt: 5, mb: 5, mr: 5 }}>
                    {data.description}
                </Typography>
            </Paper>
        </>
    )
}