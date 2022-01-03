import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import React from "react"
import styles from '../styles/Home.module.css'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import GetColsNRows from '../components/DataGripHelper'
import Search from '../components/SearchView'
import CompanyOverview from '../components/CompanyOverview'
import FlexyIncomeView from '../components/FlexyIncomeView'
import { integerPropType } from '@mui/utils'

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

const IncomePlotComponent = dynamic (
  () => import('../components/IncomePlotView'),
  { ssr: false }
)

export default function StockScreener() {
  // disable server side rendering?
  if (typeof window === 'undefined') {
    return null
  }
  const [data, setData] = useState()
  const [DCF, setDcf] = useState()
  const [income, setIncome] = useState()
  const [profile, setProfile] = useState()
  const [query, setQuery] = useState()

  const tvRef = useRef(null)

  useEffect(async () => {
    if (!query) {
      return
    }

    const response = await getShareInfo(query)
    setData(response[0])

    const dcf = await getDCF(query)
    setDcf(dcf[0])

    const income = await getIncome(query)
    setIncome(income)

    const profile = await getProfile(query)
    setProfile(profile[0])

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

  // TODO: request data concurrently
  if (data && DCF && income && profile) {
    const gauge = <GaugeComponent value={data.priceEarningsRatio} min={0} max={50} />;
    const bullet = <PlotComponent dcf={DCF.dcf} price={DCF["Stock Price"]} />;

    const entries = Object.entries(data).filter(([name, value]) => typeof value == 'number' && wantedMetrics.includes(name))
    entries.push(['eps', income[0]['eps']])
    entries.push(['beta', profile['beta']])
    const [ratioColumns, ratioRows] = GetColsNRows(entries, (val) => { return val.toFixed(3) })

    return (
      <div className={styles.Portfolio}>
        <Typography variant="h2" align="center" component="div" gutterBottom>
          {query}
        </Typography>
        <Search changeQuery={setQuery} />

        <Typography variant="h2" align="left" component="div" gutterBottom>
          Company Overview
        </Typography>
        <CompanyOverview data={profile} />
        <Divider sx={{mt:7, mb: 5}} variant='fullWidth' />

        <Typography variant="h2" align="left" component="div" gutterBottom>
          Income Statement
        </Typography>
        <div style={{ width: '100%' }}>
          <IncomePlotComponent income={income} />
          <FlexyIncomeView incomes={income} />
        </div>
        <Divider sx={{mt:7, mb: 5}} variant='fullWidth' />
        <Typography variant="h2" align="left" component="div" gutterBottom>
          Ratios
        </Typography>
        <div style={{ width: '100%' }}>
          <DataGrid rows={ratioRows} columns={ratioColumns} autoHeight density='compact' />
        </div>
        <Divider sx={{mt:7, mb: 5}} variant='fullWidth' />
        <Typography variant="h2" align="left" component="div" gutterBottom>
          Some Plotly
        </Typography>
        <div>
          PE: {data.PriceEarningsRatio}
          {gauge}
          {bullet}
        </div>
        <Divider sx={{mt:7, mb: 5}} variant='fullWidth' />
        <div>
          <WaterfallComponent
            income={income}
          />
        </div>
        <Divider sx={{mt:7, mb: 5}} variant='fullWidth' />
        <Typography variant="h2" align="left" component="div" gutterBottom>
          Trading View
        </Typography>
        <div className="tradingview-widget-container" ref={tvRef}>
          <div id="tradingview_95742"></div>
        </div>

        <Button variant="contained" onClick={() => {
          alert('clicked');
        }}>View Financials</Button>
      </div>

    )
  } else {
    return (
      <div className={styles.Portfolio}>
        <Search changeQuery={setQuery} />
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

async function getData(path) {
  const res = await fetch(getAPIUrl(path))
  const data = await res.json()
  return data
}

async function getShareInfo(ticker) {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  return await getData(`/ratios/${ticker}`)
}


async function getDCF(ticker) {
  return await getData(`/discounted-cash-flow/${ticker}`)
}

async function getIncome(ticker) {
  return await getData(`/income-statement/${ticker}`)
}

async function getProfile(ticker) {
  return await getData(`/profile/${ticker}`)
}
