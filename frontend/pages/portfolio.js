import dynamic from 'next/dynamic'
import { DataGrid } from '@mui/x-data-grid'
import { Container, Stack, Paper, Typography } from '@mui/material'
import { useState, useEffect } from 'react'

const PlotComponent = dynamic(
  () => import('../components/plotHandler'),
  { ssr: false }
)

const Portfolio = () => {
  const [portfolio, setPoftfolio] = useState(null)
  const [update, setUpdate] = useState({ type: "add" })
  const [updateCounter, setUpdateCounter] = useState(0)

  useEffect(async () => {
    const portfolio = await getPortfolio()
    setPoftfolio(portfolio)
  }, [updateCounter])

  if (!portfolio) {
    return <> Loading... </>
  }

  const ratioColumns = [
    {
      field: 'metric',
      headerName: 'metric',
      width: 150
    },
    {
      field: 'value',
      headerName: 'value',
      width: 150
    }
  ]

  const ratioRows = Object.entries(portfolio.ratios).map(([name, value], idx) => {
    return {
      id: idx,
      metric: name,
      value: value
    }
  })

  const firstPosition = portfolio.positions[Object.keys(portfolio.positions)[0]]
  const columns = ["ticker", "current_price"].concat(Object.keys(firstPosition)).map(name => {
    return {
      field: name,
      headerName: name.replace('_', ' '),
      width: 150
    }
  })

  const rows = Object.keys(portfolio.positions).map((ticker, idx) => {
    return {
      id: idx,
      ticker: ticker,
      current_price: portfolio.prices[ticker],
      cost_basis: portfolio.positions[ticker].cost_basis,
      count: portfolio.positions[ticker].count
    }
  })

  const portfolioChanger = (
    <form onSubmit={(event) => {
      event.preventDefault();
      console.log("sent update for portfolio: ", update)
      sendPortfolioUpdate(update).then(() => {
        console.log('Updating update counter to', updateCounter + 1)
        setUpdateCounter(updateCounter + 1)
      })
    }}>
      <div>
        <label>
          ActionType:
          <select onChange={(event) => {
            setUpdate(prevState => ({ ...prevState, type: event.target.value }))
          }
          }>
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Price:
          <input
            name="price"
            type="number"
            onChange={(event) => {
              setUpdate(prevState => ({ ...prevState, price: parseInt(event.target.value) }))
            }
            } />
        </label>
      </div>
      <div>
        <label>
          Count:
          <input
            name="Count"
            type="number"
            onChange={(event) => {
              setUpdate(prevState => ({ ...prevState, count: parseInt(event.target.value) }))
            }} />
        </label>
      </div>
      <div>
        <label>
          Ticker:
          <input
            name="Ticker"
            type="text"
            onChange={(event) => {
              setUpdate(prevState => ({ ...prevState, ticker: event.target.value }))
            }} />
        </label>
      </div>
      <input type="submit" value="Submit" />
    </form>
  )

  const addToBalance = (b, ticker) => b + portfolio.prices[ticker] * portfolio.positions[ticker].count
  const balance = Object.keys(portfolio.positions).reduce(addToBalance, 0)
  return (
    <Container maxWidth='md'>
      <Stack spacing={2}>
        <Paper elevation={0}>
          {/* TODO: get rid of xs copy-paste */}
          <Typography variant='h3' sx={{ ml: 2, mt: 2, mb: 2 }}> Portfolio: {portfolio.name} </Typography>
          <Typography variant='h4' sx={{ ml: 2, mt: 2, mb: 2 }}> Total balance: {balance}$ </Typography>
        </Paper>

        <Paper elevation={0}>
          <Typography variant='h5' sx={{ ml: 2, mt: 2, mb: 2 }}>Fundamental of portfolio:</Typography>
          <DataGrid rows={ratioRows} columns={ratioColumns} autoHeight density='compact' />
        </Paper>

        <Paper elevation={0}>
          <Typography variant='h5' sx={{ ml: 2, mt: 2, mb: 2 }}> Shares </Typography>
          <DataGrid rows={rows} columns={columns} autoHeight density='compact' />
        </Paper>

        <Paper elevation={0}>
          <PlotComponent dcf={portfolio.dcf} price={balance} />
        </Paper>

        <Paper elevation={0}>
          {portfolioChanger}
        </Paper>
      </Stack>
    </Container>
  )
}


const sendPortfolioUpdate = async (body) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
  const resp = await fetch('http://127.0.0.1:8080/portfolio', requestOptions)
  console.log("respo for update: ", resp)
}

const getPortfolio = async () => {
  const res = await fetch('http://127.0.0.1:8080/portfolio')
  const portfolio = await res.json()
  return portfolio
}

export default Portfolio
