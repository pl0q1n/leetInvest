import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import React from "react"
import styles from '../styles/Home.module.css'
import { DataGrid } from '@mui/x-data-grid'


const GaugeComponent = dynamic(
  () => import('../components/gaugeHandler'),
  { ssr: false }
);

const PlotComponent = dynamic(
  () => import('../components/plotHandler'),
  { ssr: false }
)

const WaterfallComponent = dynamic(
  () => import('../components/waterfallHandler'),
  { ssr: false }
)

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
  const [DCF, setDcf] = useState()
  const [income, setIncome] = useState()

  const tvRef = useRef(null)

  const { search } = window.location;
  const query = new URLSearchParams(search).get('share');

  useEffect(async () => {
    if (query) {
      const response = await getShareInfo(query)
      console.log(response)
      setData(response[0])

      const dcf = await getDCF(query)
      console.log(dcf)
      setDcf(dcf[0])

      const income = await getIncome(query)
      console.log("income")
      console.log(income)
      setIncome(income)

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = false;
      const symbol = `NASDAQ:${query}`
      script.onload = () => {
        new window.TradingView.widget({
          "width": "100%",
          "height": 610,
          "symbol": symbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": false,
          "container_id": "tradingview_95742"
        })
      }
      tvRef.current.appendChild(script)
    }
  }, [query])


  const wantedMetrics = [
    "grossProfitMargin",
    "operatingProfitMargin",
    "netProfitMargin",
    "returnOnAssets",
    "returnOnEquity",
    "returnOnCapitalEmployed",
    "debtRatio",
    "debtEquityRatio",
    "interestCoverage",
    "operatingCashFlowPerShare",
    "freeCashFlowPerShare",
    "priceToBookRatio",
    "priceToSalesRatio",
    "priceEarningsRatio",
    "priceEarningsToGrowthRatio",
    "priceSalesRatio",
    "dividendYield",
    "priceFairValue",
  ]

  if (data && DCF && income) {
    const gauge = <GaugeComponent value={data.priceEarningsRatio} min={0} max={50} />;
    const bullet = <PlotComponent dcf={DCF.dcf} price={DCF["Stock Price"]} />;


    // TODO: Move all table construction to separate files
    const ratioColumns = [
      {
        field: 'metric',
        headerName: 'metric',
        width: 350
      },
      {
        field: 'value',
        headerName: 'value',
        width: 350
      }
    ]
    data = Object.entries(data).filter( ([name, value]) => typeof value == 'number' && wantedMetrics.includes(name) )
    const ratioRows = data.map(([name, value], idx) => {
      return {
        id: idx,
        metric: name,
        value: value.toFixed(3)
      }
    })
    

    const incomeColums = [
    {
      field: 'metric',
      headerName: 'metric',
      width: 350
    },
    {
      field: 'value',
      headerName: 'value',
      width: 350
    }
    ]


    
    const incomeRows = Object.entries(income[0]).map(([name, value], idx) => {
      return {
        id: idx,
        metric: name,
        value: value
      }
    })

    return (
      <div className={styles.Portfolio}>
        <div style={{textAlign:'center'}}>{query}</div>
        <Search />
        <br></br>
        <div style={{width: '100%'}}>
        <DataGrid rows={ratioRows} columns={ratioColumns} autoHeight density='compact' />
        </div>
        <br></br>
        <DataGrid rows={incomeRows} columns={incomeColums} autoHeight density='compact' />
        <br></br>
        <div>
          PE: {data.PriceEarningsRatio}
          {gauge}
          {bullet}
        </div>
        <div>
          <WaterfallComponent
            income={income}
          />
        </div>
        <div className="tradingview-widget-container" ref={tvRef}>
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

function getAPIUrl(path) {
  const useLocalAPI = true
  if (useLocalAPI) {
    return `http://localhost:80/finapi/v3${path}`
  }

  const accessToken = '1bcc9d43e5eceb671cfaefb7a49ef506'
  const url = `https://financialmodelingprep.com/api/v3${path}`
  if (path.indexOf('?') != -1) {
    return `${url}&apikey=${accessToken}`
  } else {
    return `${url}?apikey=${accessToken}`
  }
}

async function getShareInfo(ticker) {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const res = await fetch(getAPIUrl(`/ratios/${ticker}`))
  const data = await res.json()
  return data
}


async function getDCF(ticker) {
  const res = await fetch(getAPIUrl(`/discounted-cash-flow/${ticker}`))
  const data = await res.json()
  return data
}

async function getIncome(ticker) {
  const res = await fetch(getAPIUrl(`/income-statement/${ticker}`))
  const data = await res.json()
  return data
}


