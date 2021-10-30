import Link from 'next/link'
import { useEffect, useState } from 'react'
import React from "react"
import styles from '../styles/Home.module.css'


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


export default function StockScreener({toRender}) {
  // disable server side rendering?
  if (typeof window === 'undefined') {
    return null
  }
  const [data, setData]=useState()

  var toRender = ( <div className={styles.Portfolio}>
    <Search/>
  </div>
  )
  const { search } = window.location;
  const query = new URLSearchParams(search).get('share');

  useEffect(async ()=>{
    if (query) {
      const response = await getShareInfo(query)
      console.log(response)
      setData(response)
    }
  },[query])

  if (data) {
      const fundamental = data
      const fundamentals_val = Object.keys(fundamental).map((title) => <tr>{title}: {fundamental[title]}</tr>)
      const full_symbol = `NASDAQ=${query}`
      console.log(full_symbol)
      return (
        <div className={styles.Portfolio}>
          <Search/>
          <div>{fundamentals_val}</div>
        </div>
      )
  } else {
    toRender = (
      <div className={styles.Portfolio}>
        <Search/>
      </div>
    )

  }

  return (
    toRender
  )

}

export async function getShareInfo(ticker) {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const res = await fetch(`http://127.0.0.1:8080/share?ticker=${ticker}`)
  const data = await res.json()

  return data
}


