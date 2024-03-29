package main

import (
	"errors"

	fmp "github.com/spacecodewor/fmpcloud-go"
	requests "github.com/spacecodewor/fmpcloud-go/objects"
)

type APIClient struct {
	client *fmp.APIClient
}

func NewClient(url string, key string) (*APIClient, error) {
	client, err := fmp.NewAPIClient(fmp.Config{APIUrl: fmp.APIUrl(url), APIKey: key})
	if err != nil {
		return nil, err
	}

	return &APIClient{client: client}, nil
}

func (api *APIClient) GetCurrentPrice(ticker string) (float32, error) {
	quote, err := api.client.Stock.QuoteShort(ticker)
	if err != nil {
		return 0.0, err
	}

	if len(quote) == 0 {
		return 0.0, errors.New("empty response")
	}

	return float32(quote[0].Price), nil
}

func (api *APIClient) GetRatios(ticker string) (Ratios, error) {
	request := requests.RequestFinancialRatios{
		Symbol: ticker,
		Period: requests.CompanyValuationPeriodAnnual,
		Limit:  1,
	}
	ratios, err := api.client.CompanyValuation.FinancialRatios(request)
	if err != nil {
		return Ratios{}, err
	}

	if len(ratios) == 0 {
		return Ratios{}, errors.New("empty response")
	}

	latestRatios := ratios[0]
	return Ratios{
		PE:  float32(latestRatios.PriceEarningsRatio),
		PEG: float32(latestRatios.PriceEarningsToGrowthRatio),
		PS:  float32(latestRatios.PriceToSalesRatio),
		PB:  float32(latestRatios.PriceToBookRatio),
	}, nil
}

type Holder = requests.InstitutionalHolder

// NOTE: only for "premium" members
func (api *APIClient) GetInstitutionalHolders(ticker string) ([]Holder, error) {
	return api.client.CompanyValuation.InstitutionalHolders(ticker)
}

type DCF = requests.DiscountedCashFlow

func (api *APIClient) GetDCFValuation(ticker string) (DCF, error) {
	dcf, err := api.client.CompanyValuation.DiscountedCashFlow(ticker)
	if err != nil {
		return DCF{}, err
	}

	if len(dcf) == 0 {
		return DCF{}, errors.New("empty response")
	}

	return dcf[0], nil
}

// Get income statement for last year
func (api *APIClient) GetIncomeStatement(ticker string, limit int) ([]requests.IncomeStatement, error) {
	reports, err := api.client.CompanyValuation.IncomeStatement(requests.RequestIncomeStatement{
		Symbol: ticker,
		Period: requests.CompanyValuationPeriodAnnual,
		Limit:  int64(limit),
	})

	if err != nil {
		return []requests.IncomeStatement{}, err
	}

	if len(reports) == 0 {
		return []requests.IncomeStatement{}, errors.New("empty response")
	}

	return reports, nil
}
