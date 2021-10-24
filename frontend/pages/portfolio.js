import Link from 'next/link'
import styles from '../styles/Home.module.css'


export default function Portfolio() {
  return (
    <div className={styles.container}>
        <div className={styles.simple}>
            <Link href="/"><h1>Home</h1></Link>
        </div>
        

        <div>Something should be here</div> 

    </div>

  )
}
