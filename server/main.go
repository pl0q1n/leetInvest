package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type Server struct {
	// TODO: store in DB
	portfolio Portfolio

	mux    *http.ServeMux
	client *APIClient
}

func NewServer(apiKey string) (*Server, error) {
	client, err := NewClient(apiKey)
	if err != nil {
		return nil, err
	}

	server := &Server{
		portfolio: MockPortfolio(),

		mux:    http.NewServeMux(),
		client: client,
	}

	server.mux.HandleFunc("/share", func(rw http.ResponseWriter, r *http.Request) {
		// FIXME
		rw.Header().Set("Access-Control-Allow-Origin", "*")
		rw.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method != http.MethodGet {
			http.Error(rw, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		ticker := r.URL.Query().Get("ticker")
		if ticker == "" {
			http.Error(rw, "Invalid ticker", http.StatusBadRequest)
			return
		}

		log.Printf("Requesting fundamentals of %v\n", ticker)
		ratios, err := server.client.GetFundamentals(ticker)
		if err != nil {
			http.Error(rw, "Failed to obtain stock fundamentals", http.StatusInternalServerError)
			log.Printf("API request error: %v\n", err)
			return
		}

		server.sendResponse(rw, ratios)
	})

	server.mux.HandleFunc("/dcf", func(rw http.ResponseWriter, r *http.Request) {
		// FIXME
		rw.Header().Set("Access-Control-Allow-Origin", "*")
		rw.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		
		if r.Method != http.MethodGet {
			http.Error(rw, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		ticker := r.URL.Query().Get("ticker")
		if ticker == "" {
			http.Error(rw, "Invalid ticker", http.StatusBadRequest)
			return
		}

		log.Printf("Requesting DCF valution of %v\n", ticker)
		dcf, err := server.client.GetDCFValuation(ticker)
		if err != nil {
			// TODO: make sure ticker is valid, otherwise it is client error, not internal server error
			http.Error(rw, "Faield to obtain DCF valuation", http.StatusInternalServerError)
			log.Printf("API request error: %v\n", err)
			return
		}

		server.sendResponse(rw, dcf)
	})

	server.mux.HandleFunc("/portfolio", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("Portfolio requested")
		server.sendResponse(rw, server.portfolio)
	})

	return server, nil
}

func (server *Server) sendResponse(rw http.ResponseWriter, object interface{}) {
	data, err := json.Marshal(&object)
	if err != nil {
		log.Println("Failed to marshal response:", err)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	_, err = rw.Write(data)
	if err != nil {
		log.Println("Failed to send response:", err)
	}
}

func (server *Server) Run(addr string) error {
	log.Println("Listening on", addr)
	return http.ListenAndServe(addr, server.mux)
}

// TODO: decouple share (as "in general") concept from position (as "in portfolio")
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

// TODO: rename to Position
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
		multiplier := v.AveragePrice * float32(v.Count) / p.Balance // weight for single ticker
		newFund.PE += multiplier * v.Fundamental.PE
		newFund.PEG += multiplier * v.Fundamental.PEG
		newFund.EPS += multiplier * v.Fundamental.EPS
		newFund.Beta += multiplier * v.Fundamental.Beta
		newFund.PS += multiplier * v.Fundamental.PS
		newFund.PB += multiplier * v.Fundamental.PB
	}

	return newFund
}

func (p *Portfolio) updateShares(share *Share) {
	// TODO: Provide optional date time of buying share
	purchase := Purchase{time.Now(), share.Ticker, share.Count, share.AveragePrice}
	p.Purchases[share.Ticker] = append(p.Purchases[share.Ticker], purchase)
	p.Balance = p.Balance + share.AveragePrice*float32(share.Count)
	p.Fundamental = p.calculateFundamental()

}

// Both for buys and sells
func (p *Portfolio) AddShare(share *Share) {
	_, exists := p.Shares[share.Ticker]
	if !exists {
		p.Shares[share.Ticker] = share
		p.updateShares(share)

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

func main() {
	// FIXME: unhardcode api key
	server, err := NewServer("1bcc9d43e5eceb671cfaefb7a49ef506")
	if err != nil {
		log.Fatal(err)
	}

	// FIXME: unhardcode addr
	err = server.Run("127.0.0.1:8080")
	if err != nil {
		log.Fatal(err)
	}
}
