import styles from '../styles/Home.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Leet [not really] invest 
        </h1>

        <div className={styles.grid}>
          
          <Link href="/portfolio ">
            <a className={styles.card}>
              <h2>Portfolio &rarr;</h2>
              <p>Discover your personal leet porfolio</p>
            </a>
          </Link>

          <Link href="/stockScreener">
            <a className={styles.card}>
              <h2>Something else &rarr;</h2>
              <p>Nothing is here for now folks</p>
            </a>
          </Link>
        
        </div>
      </main>
    </div>
  )
}
