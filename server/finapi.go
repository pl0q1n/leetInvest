package main

import (
	fmp "github.com/spacecodewor/fmpcloud-go"
	requests "github.com/spacecodewor/fmpcloud-go/objects"
)

type APIClient struct {
	client *fmp.APIClient
}

func NewClient(key string) (*APIClient, error) {
	client, err := fmp.NewAPIClient(fmp.Config{APIKey: key})
	if err != nil {
		return nil, err
	}

	return &APIClient{client: client}, nil
}

func (api *APIClient) GetFundamentals(ticker string) (Fundamentals, error) {
	request := requests.RequestFinancialRatios{
		Symbol: ticker,
		Period: requests.CompanyValuationPeriodAnnual,
		Limit:  1,
	}
	ratios, err := api.client.CompanyValuation.FinancialRatios(request)
	if err != nil {
		return Fundamentals{}, err
	}

	latestRatios := ratios[0]
	return Fundamentals{
		PE:   float32(latestRatios.PriceEarningsRatio),
		PEG:  float32(latestRatios.PriceEarningsToGrowthRatio),
		EPS:  0.0,
		Beta: 0.0,
		PS:   float32(latestRatios.PriceToSalesRatio),
		PB:   float32(latestRatios.PriceToBookRatio),
	}, nil
}
