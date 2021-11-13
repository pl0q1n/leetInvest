import Link from 'next/link'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'

const PlotComponent = dynamic(
  () => import('../components/plotHandler'),
  {ssr: false}
)

const WaterfallComponent = dynamic(
  () => import('../components/waterfallHandler'),
  {ssr: false}
)

// posts will be populated at build time by getStaticProps()
function Portfolio({ posts }) {
  console.log(posts)

  if (posts) {
    
    const fundamentals = posts.Fundamental
    const fundamentals_val = Object.keys(fundamentals).map((title) => <tr>{title}: {fundamentals[title]}</tr>)


    // looks ugly as fuck
    const share_header = Object.keys(posts.shares[Object.keys(posts.shares)[0]]).map((what) => 
      {
        if (what != "Fundamental") {
          return <td>{what}</td>
        }
      }
    )

    const shares = Object.keys(posts.shares).map((share) => 
      <tr>
      <td>{posts.shares[share].Ticker}</td>
      <td>{posts.shares[share].FullName}</td>
      <td>{posts.shares[share].AveragePrice}</td>
      <td>{posts.shares[share].CurrPrice}</td>
      <td>{posts.shares[share].Count}</td>
      </tr>
      )  
    

    return (
      <div className={styles.Portfolio}>
        <h1>Portfolio: {posts.Name}</h1>
        <h1>Total balance: {posts.Balance}$</h1>
        <h2>Fundamental of portfolio:</h2>
        <div>{fundamentals_val}</div>
        <h2>Shares:</h2>
        <div><table cellspacing="2" border="1" cellPadding="5" width="600">
          <tr>{share_header}</tr>
          {shares}  
        </table></div>
        <div>
          <PlotComponent dcf={1200} price={1234} />
        </div>
        <div>
          <WaterfallComponent />
        </div>
      </div>
    )

  }
  console.log("naf to see")

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
