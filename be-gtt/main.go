package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

//
// --- MODELS ---
//

type Vehicle struct {
	Id       int     `json:"id"`
	Tipo     string  `json:"tipo"`
	Disabili bool    `json:"disabili"`
	Lat      float64 `json:"lat"`
	Long     float64 `json:"lon"`
	Update   string  `json:"aggiornamento"`
}

type Stop struct {
	Code     string  `json:"codice"`
	Name     string  `json:"nome"`
	Lat      float64 `json:"lat"`
	Long     float64 `json:"lon"`
	Disabili bool    `json:"disabili"`
}

type FeatureCollection struct {
	Type     string    `json:"type"`
	Features []Feature `json:"features"`
}

type Feature struct {
	Type       string     `json:"type"`
	Geometry   Geometry   `json:"geometry"`
	Properties Properties `json:"properties"`
}

type Geometry struct {
	Type        string      `json:"type"`
	Coordinates interface{} `json:"coordinates"`
}

type Properties struct {
	Name      string `json:"name"`
	Popup     string `json:"popupContent"`
	Direction string `json:"direction"`
}

type PathStop struct {
	Code      string  `json:"code"`
	Name      string  `json:"name"`
	Lat       float64 `json:"lat"`
	Long      float64 `json:"lon"`
	Direction string  `json:"direction"`
}

//
// --- MAIN ---
//

func main() {

	// Create a new Gin router
	r := gin.Default()

	// Vehicles for a line
	r.GET("/api/lines/:id", func(c *gin.Context) {
		url := fmt.Sprintf("https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetVeicoliPerLineaWsJson?linea=%s", c.Param("id"))

		res, err := http.Get(url)
		if err != nil {
			c.String(500, "Error fetching data: %s", err)
			return
		}
		defer res.Body.Close()

		var vehicles []Vehicle
		if err := json.NewDecoder(res.Body).Decode(&vehicles); err != nil {
			c.String(500, "Error parsing JSON: %s", err)
			return
		}

		c.JSON(200, vehicles)
	})

	// All stops
	r.GET("/api/stops", func(c *gin.Context) {
		url := "https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetFermateJson"

		res, err := http.Get(url)
		if err != nil {
			c.String(500, "Error fetching data: %s", err)
			return
		}
		defer res.Body.Close()

		var stops []Stop
		if err := json.NewDecoder(res.Body).Decode(&stops); err != nil {
			c.String(500, "Error parsing JSON: %s", err)
			return
		}

		c.JSON(200, stops)
	})

	// Path stops grouped by direction
	r.GET("/api/path/lines/:id/path", func(c *gin.Context) {
		url := fmt.Sprintf("https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetLineaGeoJson?linea=%s", c.Param("id"))

		res, err := http.Get(url)
		if err != nil {
			c.String(500, "Error fetching data: %s", err)
			return
		}
		defer res.Body.Close()

		body, _ := io.ReadAll(res.Body)

		var fc FeatureCollection
		if err := json.Unmarshal(body, &fc); err != nil {
			c.String(500, "Error parsing JSON: %s", err)
			return
		}

		// Map direction -> stops
		result := map[string][]PathStop{
			"As": {},
			"Di": {},
		}

		for _, f := range fc.Features {
			if f.Geometry.Type == "Point" {

				coords, ok := f.Geometry.Coordinates.([]any)
				if !ok || len(coords) < 2 {
					continue
				}
				lon, _ := coords[0].(float64)
				lat, _ := coords[1].(float64)

				stop := PathStop{
					Code:      f.Properties.Name,
					Name:      f.Properties.Popup,
					Lat:       lat,
					Long:      lon,
					Direction: f.Properties.Direction,
				}

				// Add stop to direction
				switch f.Properties.Direction {
				case "As":
					result["As"] = append(result["As"], stop)
				case "Di":
					result["Di"] = append(result["Di"], stop)
				}
			}
		}

		c.JSON(200, result)
	})

	// Run server
	r.Run(":8080")
}
