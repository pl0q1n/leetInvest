import Link from 'next/link'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const PlotComponent = dynamic(
  () => import('../components/plotHandler'),
  { ssr: false }
)

// posts will be populated at build time by getStaticProps()
function Portfolio({ posts }) {
  const [update, setUpdate] = useState({type: "add"})

  console.log(posts)

  if (!posts) {
    console.log("you fucked up")
    return
  }

  const ratios = posts.ratios
  const ratiosValues = Object.keys(ratios).map((title) => <tr>{title}: {ratios[title]}</tr>)

  const firstPosition = posts.positions[Object.keys(posts.positions)[0]]
  const valuesHeader = Object.keys(firstPosition).map((key) => <td>{key.replace('_', ' ')}</td>)
  const header = [<td>ticker</td>, <td>current price</td>].concat(valuesHeader)

  const positions = Object.keys(posts.positions).map((ticker) =>
    <tr>
      <td>{ticker}</td>
      <td>{posts.prices[ticker]}</td>
      <td>{posts.positions[ticker].cost_basis}</td>
      <td>{posts.positions[ticker].count}</td>
    </tr>
  )
  const portfolioChanger = (
    <form onSubmit={(event)=>{
      console.log("sent update for portfolio: ", update)
      SendPortfolioUpdate(update)
      event.preventDefault();
    }}>
      <div>
        <label>
          ActionType:
          <select onChange={(event)=>{
            setUpdate(prevState => ({...prevState, type: event.target.value}))
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
            onChange={(event)=>{
              setUpdate(prevState => ({...prevState, price: parseInt(event.target.value)}))
                }
            }/>
        </label>
      </div>
      <div>
        <label>
          Count:
          <input
            name="Count"
            type="number"
            onChange={(event)=>{
              setUpdate(prevState => ({...prevState, count: parseInt(event.target.value)}))
                }} />
        </label>
      </div>
      <div>
        <label>
          Ticker:
          <input
            name="Ticker"
            type="text"
            onChange={(event)=>{
              setUpdate(prevState => ({...prevState, ticker: event.target.value}))
                }} />
        </label>
      </div>
        <input type="submit" value="Submit" />
      </form>
  )

  const addToBalance = (b, ticker) => b + posts.prices[ticker] * posts.positions[ticker].count
  const balance = Object.keys(posts.positions).reduce(addToBalance, 0)
  return (
    <div className={styles.Portfolio}>
      <h1>Portfolio: {posts.name}</h1>
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
        <PlotComponent dcf={posts.dcf} price={balance} />
      </div>
      <div>
      {portfolioChanger}
      </div>
    </div>
  )
}


export async function SendPortfolioUpdate(body) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
    };
  const resp = await fetch('http://127.0.0.1:8080/portfolio', requestOptions)

  console.log("respo for update: ", resp)
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps() {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const res = await fetch('http://127.0.0.1:8080/portfolio')
  const posts = await res.json()

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      posts,
    },
  }
}

export default Portfolio
