package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type Share struct {
	Ticker       string       `json:"Ticker"`
	FullName     string       `json:"FullName"`
	AveragePrice float32      `json:"AveragePrice"`
	CurrPrice    float32      `json:"CurrPrice"`
	Count        int          `json:"Count"` // negative for shorts
	Fundamental  Fundamentals `json:"Fundamental"`
}

type Fundamentals struct {
	PE   float32 `json:"PE"`
	PEG  float32 `json:"PEG"`
	EPS  float32 `json:"EPS"`
	Beta float32 `json:"Beta"`
	PS   float32 `json:"PS"`
	PB   float32 `json:"PB"`
}

type Purchase struct {
	Date         time.Time
	Ticker       string
	Amount       int // negative for shorts
	AveragePrice float32
}

type Portfolio struct {
	Name      string  `json:"Name"`
	Balance   float32 `json:"Balance"`
	Purchases map[string][]Purchase
	// use pointer to easily change underlying share in map
	Shares      map[string]*Share `json:"shares"`
	Fundamental Fundamentals      `json:"Fundamental"`
}

func (p *Portfolio) calculateFundamental() Fundamentals {
	newFund := Fundamentals{}
	for _, v := range p.Shares {
		multiplier := v.AveragePrice * float32(v.Count) / p.Balance
		log.Printf("multiplier %f ", multiplier)
		newFund.PE += multiplier * v.Fundamental.PE
		newFund.PEG += multiplier * v.Fundamental.PEG
		newFund.EPS += multiplier * v.Fundamental.EPS
		newFund.Beta += multiplier * v.Fundamental.Beta
		newFund.PS += multiplier * v.Fundamental.PS
		newFund.PB += multiplier * v.Fundamental.PB
	}

	return newFund
}

var globalPortfolio Portfolio

// // TODO: implement it for same stock (if it's not new for the portfolio)
// func (p Portfolio) updateFundamental(share *Share) {
// 	// update weight
// 	// probably could be eluminated by something like sum(old_fundamentals) * (old_balance/balance) + metric_name * new_share_balance/balance
// 	old_balance := p.Balance - float32(share.Count)*share.AveragePrice
// 	old_fund_mult := old_balance / p.Balance
// 	new_fund_mult := float32(share.Count) * share.AveragePrice / p.Balance

// 	// Some metrics could be less than 0. How to work around it? Could (will) not work on share deletion
// 	p.Fundamental.PE = p.Fundamental.PE*float32(old_fund_mult) + float32(new_fund_mult)*share.Fundamental.PE
// 	p.Fundamental.PEG = p.Fundamental.PEG*float32(old_fund_mult) + float32(new_fund_mult)*share.Fundamental.PEG
// 	p.Fundamental.EPS = p.Fundamental.EPS*float32(old_fund_mult) + float32(new_fund_mult)*share.Fundamental.EPS
// 	p.Fundamental.Beta = p.Fundamental.Beta*float32(old_fund_mult) + float32(new_fund_mult)*share.Fundamental.Beta
// 	p.Fundamental.PS = p.Fundamental.PS*float32(old_fund_mult) + float32(new_fund_mult)*share.Fundamental.PS
// 	p.Fundamental.PB = p.Fundamental.PB*float32(old_fund_mult) + float32(new_fund_mult)*share.Fundamental.PB
// }

func (p *Portfolio) updateShares(share *Share) {
	// TODO: Provide optional date time of buying share
	purchase := Purchase{time.Now(), share.Ticker, share.Count, share.AveragePrice}
	p.Purchases[share.Ticker] = append(p.Purchases[share.Ticker], purchase)
	log.Println("updating p.baalnce: %f \n", p.Balance)
	log.Printf("share avg: %f, \n", share.AveragePrice)
	log.Printf("share count: %d, \n", share.Count)
	p.Balance = p.Balance + share.AveragePrice*float32(share.Count)
	log.Printf("updated p.balance: %f \n", p.Balance)
	p.Fundamental = p.calculateFundamental()
	log.Printf("updated x3 p.balance: %f \n", p.Balance)

}

// Both for buys and sells
func (p *Portfolio) AddShare(share *Share) {
	_, exists := p.Shares[share.Ticker]
	if !exists {
		p.Shares[share.Ticker] = share
		p.updateShares(share)
		log.Printf("updated p.balance x2: %f \n", p.Balance)
		log.Printf("p shares: %d \n", len(p.Shares))

	} else {
		newCount := p.Shares[share.Ticker].Count + share.Count
		oldMult := float32(p.Shares[share.Ticker].Count) / float32(newCount)
		newMult := float32(share.Count) / float32(newCount)
		p.Shares[share.Ticker].AveragePrice = p.Shares[share.Ticker].AveragePrice*oldMult + share.AveragePrice*newMult
		p.Shares[share.Ticker].CurrPrice = share.CurrPrice
		p.Shares[share.Ticker].Count = newCount
		// TODO: check it for real
		p.updateShares(share)
	}

}

func (p *Portfolio) DeleteShare(share *Share) {
	p.updateShares(share)

}

func MockPortfolio() Portfolio {
	port := Portfolio{}
	port.Name = "Mock"
	port.Shares = make(map[string]*Share)
	port.Purchases = make(map[string][]Purchase)

	{
		share := Share{}

		// apple on 9 oct 2021
		share.AveragePrice = 142.9
		share.Count = 50
		share.CurrPrice = 142.9
		share.FullName = "APPLE"
		share.Ticker = "AAPL"
		share.Fundamental.EPS = 5.11
		share.Fundamental.PB = 36.9
		share.Fundamental.PE = 27.9
		share.Fundamental.PEG = 1.41
		share.Fundamental.PS = 6.75
		share.Fundamental.Beta = 1.22
		port.AddShare(&share)
	}

	{
		share := Share{}
		// amzn on 9 oct 2021
		share.AveragePrice = 3288
		share.Count = 5
		share.CurrPrice = 3288
		share.FullName = "AMAZON"
		share.Ticker = "AMZN"
		share.Fundamental.EPS = 57.38
		share.Fundamental.PB = 14.47
		share.Fundamental.PE = 57.31
		share.Fundamental.PEG = 1.60
		share.Fundamental.PS = 3.76
		share.Fundamental.Beta = 1.16

		port.AddShare(&share)
	}

	return port
}

func portfolioHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		bytes, err := json.Marshal(&globalPortfolio)
		if err != nil {
			http.Error(w, "Invalid marshaling", http.StatusInternalServerError)
			return
		}

		_, err = w.Write(bytes)
		if err != nil {
			http.Error(w, "Can't write to response", http.StatusInternalServerError)
			return
		}

		return

	} else {
		http.Error(w, "wrong method for portfolio", http.StatusInternalServerError)
		return
	}
}

func main() {
	globalPortfolio = MockPortfolio()
	log.Println("Serving at: ", 8080)
	http.HandleFunc("/portfolio", portfolioHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
