import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import React from "react"
import styles from '../styles/Home.module.css'

const GaugeComponent = dynamic(
  () => import('../components/gaugeHandler'),
  {ssr: false}
);


const Search = () => {
  return (
   <form>
        <label htmlFor="header-search">
            <span className="visually-hidden">Share search</span>
        </label>
        <input
            type="text"
            id="header-search"
            placeholder="Enter ticker"
            name="share"
        />
        <button type="submit">View</button>
    </form>
  )
}

export default function StockScreener() {
  // disable server side rendering?
  if (typeof window === 'undefined') {
    return null
  }
  const [data, setData] = useState()
  const [dcf, setDcf] = useState()
  const tvRef = useRef(null)

  const { search } = window.location;
  const query = new URLSearchParams(search).get('share');

  useEffect(async ()=>{
    if (query) {
      const response = await getShareInfo(query)
      console.log(response)
      setData(response)

      const dcf = await getDCF(query)
      console.log(dcf)
      setDcf(dcf)

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = false;
      const symbol = `NASDAQ:${query}`
      script.onload = () => {
      new window.TradingView.widget({
        "width": 980,
        "height": 610,
        "symbol": symbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "ru",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_95742"
      })}
      tvRef.current.appendChild(script)
    }
  },[query])

  useEffect(() => {

  },[])



  if (data) {
      const fundamental = data
      const fundamentals_val = Object.keys(fundamental).map((title) => <tr>{title}: {fundamental[title]}</tr>)
      const full_symbol = `NASDAQ=${query}`
      console.log(full_symbol)
      const gauge = <GaugeComponent pe={fundamental.PE} min={0} max={50} />; 
      return (
      <div className={styles.Portfolio}>
        <Search />
        <div>{fundamentals_val}</div>
        <br></br>
        <div>
          PE: {fundamental.PE}
          {gauge}
        </div>
        <div  className="tradingview-widget-container" ref={tvRef}>
          <div id="tradingview_95742"></div>
        </div>
      </div>

      )
  } else {
    return (
      <div className={styles.Portfolio}>
        <Search />
      </div>
      
    )

  }

}

export async function getShareInfo(ticker) {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const res = await fetch(`http://127.0.0.1:8080/share?ticker=${ticker}`)
  const data = await res.json()
  return data
}

export async function getDCF(ticker) {
  const res = await fetch(`http://127.0.0.1:8080/dcf?ticker=${ticker}`)
  const data = await res.json()
  return data
}


