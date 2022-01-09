import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import React from "react"
import styles from '../styles/Home.module.css'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Divider from '@mui/material/Divider';
import GetColsNRows from '../components/DataGripHelper'
import Search from '../components/SearchView'
import CompanyOverview from '../components/CompanyOverview'
import FlexyIncomeView from '../components/FlexyIncomeView'

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
  const [ratios, setRatios] = useState()
  const [DCF, setDcf] = useState()
  const [income, setIncome] = useState()
  const [profile, setProfile] = useState()
  const [query, setQuery] = useState()
  const [sectorsPE, setSectorsPE] = useState()
  const [estimates, setEstimates] = useState()
  const tvRef = useRef(null)

  useEffect(async () => {
    if (!query) {
      return
    }

    const outlook = await getCompanyOutlook(query)
    setRatios(outlook.ratios[0])
    setDcf({"dcf": outlook.profile.dcf, "Stock Price": outlook.profile.price})
    setIncome(outlook.financialsAnnual.income)
    setProfile(outlook.profile)

    const estimates = await getEstimates(query)
    setEstimates(estimates)

    const sectorsPE = await getSectorsPE()
    const sectorsToPE = Object.fromEntries(sectorsPE.map((it) => {
      return [it.sector, it.pe]
    }))
    setSectorsPE(sectorsToPE)

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
    "grossProfitMarginTTM",
    "operatingProfitMarginTTM",
    "netProfitMarginTTM",
    "returnOnAssetsTTM",
    "returnOnEquityTTM",
    "returnOnCapitalEmployedTTM",
    "debtRatioTTM",
    "debtEquityRatioTTM",
    "interestCoverageTTM",
    "operatingCashFlowPerShareTTM",
    "freeCashFlowPerShareTTM",
    "priceToBookRatioTTM",
    "priceToSalesRatioTTM",
    "priceEarningsRatioTTM",
    "priceEarningsToGrowthRatioTTM",
    "priceSalesRatioTTM",
    "dividendYieldTTM",
    "priceFairValueTTM",
  ]

  // TODO: request data concurrently
  if (ratios && DCF && income && profile && sectorsPE && estimates) {
    const gauge = <GaugeComponent value={ratios.priceEarningsRatioTTM} min={0} max={50} sector={Number(sectorsPE[profile.sector])}/>;
    const bullet = <PlotComponent dcf={DCF.dcf} price={DCF["Stock Price"]} />;

    const entries = Object.entries(ratios).filter(([name, value]) => typeof value == 'number' && wantedMetrics.includes(name))
    entries.push(['eps', income[0]['eps']])
    entries.push(['beta', profile['beta']])
    entries.push(['forward p/e', profile.price/estimates[1].estimatedEpsAvg])

    entries.sort().reverse()
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
          <IncomePlotComponent income={income} estimates={estimates}/>
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
  const useLocalAPI = false
  if (useLocalAPI) {
    return `http://localhost:80/finapi${path}`
  }

  const accessToken = 'cbe49ef446ce33c830f942c0e63049c8'
  const url = `https://financialmodelingprep.com/api${path}`
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

async function getSectorsPE() {
  var today = new Date();
  var date = today.toISOString().split('T')[0];
  // TODO GIVE IT A PROPER EXCHANGE
  return await getData(`/v4/sector_price_earning_ratio?date=${date}&exchange=NASDAQ`)
}

async function getCompanyOutlook(ticker) {
  return await getData(`/v4/company-outlook?symbol=${ticker}`)
}

async function getEstimates(ticker) {
  return await getData(`/v3/analyst-estimates/${ticker}?limit=2`)
}