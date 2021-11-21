package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	// TODO: store in DB
	portfolio Portfolio

	router *gin.Engine
	client *APIClient
}

func NewServer(apiKey string) (*Server, error) {
	client, err := NewClient(apiKey)
	if err != nil {
		return nil, err
	}

	router := gin.Default()
	router.Use(cors.Default())

	server := &Server{
		portfolio: MockPortfolio(),

		router: router,
		client: client,
	}

	server.router.GET("/share", func(c *gin.Context) {
		ticker := c.Query("ticker")
		if ticker == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid ticker",
			})
			return
		}

		ratios, err := server.client.GetRatios(ticker)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "internal error",
			})
			log.Printf("API request error: %v\n", err)
			return
		}

		c.JSON(http.StatusOK, ratios)
	})

	server.router.GET("/dcf", func(c *gin.Context) {
		ticker := c.Query("ticker")
		if ticker == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid ticker",
			})
			return
		}

		dcf, err := server.client.GetDCFValuation(ticker)
		if err != nil {
			// TODO: make sure ticker is valid, otherwise it is client error, not internal server error
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "internal error",
			})
			log.Printf("API request error: %v\n", err)
			return
		}

		c.JSON(http.StatusOK, dcf)
	})

	server.router.GET("/income", func(c *gin.Context) {
		ticker := c.Query("ticker")
		if ticker == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ticker"})
			return
		}

		rawLimit := c.Query("limit")
		if rawLimit == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
			return
		}
		limit, err := strconv.Atoi(rawLimit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
			return
		}

		income, err := server.client.GetIncomeStatement(ticker, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			log.Printf("API request error: %v\n", err)
			return
		}

		c.JSON(http.StatusOK, income)
	})

	server.router.GET("/portfolio", func(c *gin.Context) {
		type PortfolioResponse struct {
			Portfolio
			Ratios Ratios `json:"ratios"`
		}

		ratios, err := GetAggregateRatios(&server.portfolio, server.client)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			log.Printf("API request error: %v\n", err)
			return
		}

		c.JSON(http.StatusOK, PortfolioResponse{
			server.portfolio,
			ratios,
		})
	})

	server.router.POST("/portfolio", func(c *gin.Context) {
		log.Printf("Portfolio post got")
		var edit PortfolioEdit
		if err := c.ShouldBindJSON(&edit); err != nil {
			log.Printf("not parsed\n %s", err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("parsed")

		switch edit.Type {
		case "buy":
			c.JSON(http.StatusNotImplemented, nil)
		case "sell":
			c.JSON(http.StatusNotImplemented, nil)
		case "add":
			// TODO: validate ticker
			server.portfolio.AddPosition(edit.Ticker, Position{
				Count: edit.Count,
				Price: edit.Price,
			})
			c.JSON(http.StatusOK, nil)
		case "remove":
			err := server.portfolio.RemovePosition(edit.Ticker, edit.Count)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			} else {
				c.JSON(http.StatusOK, nil)
			}
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid edit type"})
		}
	})

	return server, nil
}

type PortfolioEdit struct {
	Type   string  `json:"type"` // buy/sell or add/remove
	Count  uint    `json:"count"`
	Ticker string  `json:"ticker"`
	Price  float32 `json:"price,omitempty"`
}

func (server *Server) Run(addr string) error {
	log.Println("Listening on", addr)
	return server.router.Run(addr)
}

type Ratios struct {
	PE   float32 `json:"PE"`
	PEG  float32 `json:"PEG"`
	EPS  float32 `json:"EPS"`
	Beta float32 `json:"Beta"`
	PS   float32 `json:"PS"`
	PB   float32 `json:"PB"`
}

type Position struct {
	Price float32 `json:"price"`
	Count uint    `json:"count"`
}

func (pos *Position) TotalPrice() float32 {
	return pos.Price * float32(pos.Count)
}

func (left Position) Combine(right Position) Position {
	totalCount := left.Count + right.Count
	leftWeight := float32(left.Count) / float32(totalCount)
	rightWeight := float32(right.Count) / float32(totalCount)
	averagePrice := leftWeight*left.Price + rightWeight*right.Price

	return Position{
		Count: totalCount,
		Price: averagePrice,
	}
}

type Portfolio struct {
	Name      string              `json:"name"`
	Positions map[string]Position `json:"positions"`
}

func (p *Portfolio) GetBalance() float32 {
	balance := float32(0.0)
	for _, position := range p.Positions {
		balance += position.Price * float32(position.Count)
	}
	return balance
}

func GetAggregateRatios(p *Portfolio, client *APIClient) (Ratios, error) {
	balance := p.GetBalance()
	ratios := Ratios{}
	for ticker, position := range p.Positions {
		shareRatios, err := client.GetRatios(ticker)
		if err != nil {
			return Ratios{}, err
		}

		posWeight := position.TotalPrice() / balance

		ratios.PE += posWeight * shareRatios.PE
		ratios.PEG += posWeight * shareRatios.PEG
		ratios.EPS += posWeight * shareRatios.EPS
		ratios.Beta += posWeight * shareRatios.Beta
		ratios.PS += posWeight * shareRatios.PS
		ratios.PB += posWeight * shareRatios.PB
	}

	return ratios, nil
}

func NewPortfolio(name string) Portfolio {
	return Portfolio{
		Name:      name,
		Positions: make(map[string]Position),
	}
}

func (p *Portfolio) AddPosition(ticker string, position Position) {
	if currentPosition, exists := p.Positions[ticker]; exists {
		position = currentPosition.Combine(position)
	}

	p.Positions[ticker] = position
}

func (p *Portfolio) RemovePosition(ticker string, count uint) error {
	if currentPosition, exists := p.Positions[ticker]; exists {
		if count > currentPosition.Count {
			return errors.New("Attempt to remove more shares than available")
		}

		if count == currentPosition.Count {
			delete(p.Positions, ticker)
			return nil
		}

		p.Positions[ticker] = Position{
			Price: currentPosition.Price,
			Count: currentPosition.Count - count,
		}
		return nil
	}

	return errors.New("Attempt to remove position you don't have")
}

func MockPortfolio() Portfolio {
	portfolio := NewPortfolio("Mock")
	portfolio.AddPosition("AAPL", Position{
		Price: 142.9,
		Count: 50,
	})

	portfolio.AddPosition("AMZN", Position{
		Price: 3288,
		Count: 5,
	})

	return portfolio
}

type Config struct {
	APIKey string
	Host   string
	Port   string
}

func GetConfig() (Config, error) {
	APIKey := os.Getenv("APIKEY")
	if APIKey == "" {
		return Config{}, errors.New("Provide APIKEY environment variable")
	}

	host := os.Getenv("HOST")
	if host == "" {
		host = "127.0.0.1"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return Config{APIKey, host, port}, nil
}

func main() {
	gin.DisableConsoleColor()

	config, err := GetConfig()
	if err != nil {
		log.Fatal(err)
	}

	server, err := NewServer(config.APIKey)
	if err != nil {
		log.Fatal(err)
	}

	addr := fmt.Sprintf("%v:%v", config.Host, config.Port)
	err = server.Run(addr)
	if err != nil {
		log.Fatal(err)
	}
}
