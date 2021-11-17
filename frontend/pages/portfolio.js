import Link from 'next/link'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'

const PlotComponent = dynamic(
  () => import('../components/plotHandler'),
  { ssr: false }
)

// posts will be populated at build time by getStaticProps()
function Portfolio({ posts }) {
  console.log(posts)

  if (!posts) {
    console.log("you fucked up")
    return
  }

  const ratios = posts.ratios
  const ratiosValues = Object.keys(ratios).map((title) => <tr>{title}: {ratios[title]}</tr>)

  const firstPosition = posts.positions[Object.keys(posts.positions)[0]]
  const header = Object.keys(firstPosition).map((key) => <td>{key}</td>)

  const positions = Object.keys(posts.positions).map((ticker) =>
    <tr>
      <td>{ticker}</td>
      <td>{posts.positions[ticker].price}</td>
      <td>{posts.positions[ticker].count}</td>
    </tr>
  )

  const addToBalance = (b, position) => b + position.price * position.count
  const balance = Object.values(posts.positions).reduce(addToBalance, 0)
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
        <PlotComponent dcf={1200} price={1234} />
      </div>
    </div>
  )
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
