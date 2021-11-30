import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const PlotComponent = dynamic(
  () => import('../components/plotHandler'),
  { ssr: false }
)

const Portfolio = () => {
  const [portfolio, setPoftfolio] = useState(null)
  const [update, setUpdate] = useState({ type: "add" })

  useEffect(async () => {
    const portfolio = await getPortfolio()
    setPoftfolio(portfolio)
  }, [])

  if (!portfolio) {
    return <> Loading... </>
  }

  console.log(portfolio)

  const ratios = portfolio.ratios
  const ratiosValues = Object.keys(ratios).map((title) => <tr>{title}: {ratios[title]}</tr>)

  const firstPosition = portfolio.positions[Object.keys(portfolio.positions)[0]]
  const valuesHeader = Object.keys(firstPosition).map((key) => <td>{key.replace('_', ' ')}</td>)
  const header = [<td>ticker</td>, <td>current price</td>].concat(valuesHeader)

  const positions = Object.keys(portfolio.positions).map((ticker) =>
    <tr>
      <td>{ticker}</td>
      <td>{portfolio.prices[ticker]}</td>
      <td>{portfolio.positions[ticker].cost_basis}</td>
      <td>{portfolio.positions[ticker].count}</td>
    </tr>
  )

  const portfolioChanger = (
    <form onSubmit={(event) => {
      event.preventDefault();
      console.log("sent update for portfolio: ", update)
      sendPortfolioUpdate(update)
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
    <div className={styles.Portfolio}>
      <h1>Portfolio: {portfolio.name}</h1>
      <h1>Total balance: {balance}$</h1>
      <h2>Fundamental of portfolio:</h2>
      <div>{ratiosValues}</div>
      <h2>Shares:</h2>
      <div>
        <table cellspacing="2" border="1" cellPadding="5" width="600">
          <tr>{header}</tr>
          {positions}
        </table>
      </div>
      <div>
        <PlotComponent dcf={portfolio.dcf} price={balance} />
      </div>
      <div>
        {portfolioChanger}
      </div>
    </div>
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
