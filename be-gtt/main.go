package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// MODELS
type Line struct {
	Linea       string  `json:"linea"`
	NomeSteso   string  `json:"nomesteso"`
	PublicName  string  `json:"publicName"`
	AccDisabili int     `json:"accDisabili"`
	Regol       string  `json:"regol"`
	TipoMezzo   string  `json:"tipo_mezzo"`
	Bacino      string  `json:"bacino"`
	Percorsi    []Route `json:"percorsi"`
}

type Route struct {
	Codice      string       `json:"codice"`
	Verso       string       `json:"verso"`
	Descrizione string       `json:"descrizione"`
	Lunghezza   int          `json:"lunghezza"`
	Polyline    []Coordinate `json:"polyline"`
	Fermate     []Stop       `json:"fermate"`
	SupplyDays  []SupplyDay  `json:"supplydays"`
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type Stop struct {
	Codice   string  `json:"codice"`
	Nome     string  `json:"nome"`
	Disabili bool    `json:"disabili"`
	Lat      float64 `json:"lat"`
	Lon      float64 `json:"lon"`
}

type LineaInter struct {
	Linea       string `json:"linea"`
	Bacino      string `json:"bacino"`
	TipoMezzo   int    `json:"tipoMezzo"`
	AccDisabili int    `json:"accDisabili"`
}

type SupplyDay struct {
	Giorno    string `json:"giorno"`
	InService bool   `json:"inservice"`
}

type Vehicle struct {
	ID            int     `json:"id"`
	Tipo          string  `json:"tipo"`
	Disabili      bool    `json:"disabili"`
	Lat           float64 `json:"lat"`
	Lon           float64 `json:"lon"`
	Direzione     int     `json:"direzione"`
	Aggiornamento string  `json:"aggiornamento"`
	Occupazione   int     `json:"occupazione"`
}

func main() {

	// Create a new Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Get the lines
	r.GET("/api/lines", func(c *gin.Context) {
		data, err := os.ReadFile("lines.data")
		if err != nil {
			c.JSON(500, gin.H{
				"error": fmt.Sprintf("Error fetching data: %s", err),
			})
			return
		}

		rawLines := strings.Split(strings.TrimSpace(string(data)), "\n")

		type LineItem struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}

		var result []LineItem
		for _, l := range rawLines {
			parts := strings.SplitN(l, ";", 2) // support "id;name"
			item := LineItem{ID: strings.TrimSpace(parts[0])}
			if len(parts) > 1 {
				item.Name = strings.TrimSpace(parts[1])
			} else {
				item.Name = item.ID // fallback
			}
			result = append(result, item)
		}

		c.JSON(200, result)
	})

	// Vehicles for a line
	r.GET("/api/lines/:id", func(c *gin.Context) {
		id := c.Param("id")

		res, err := http.Get(fmt.Sprintf("https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetVeicoliPerLineaWsJson?linea=%s", id))
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

		if vehicles == nil { // make sure it's not null
			vehicles = []Vehicle{}
		}

		c.JSON(200, vehicles)
	})

	r.GET("/api/lines/:id/stops/:dr", func(c *gin.Context) {

		id := c.Param("id")
		dr := c.Param("dr")

		// Request data
		res, err := http.Get(fmt.Sprintf("https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetLineePercorsiJson?linea=%s", id))
		if err != nil {
			c.String(500, "Error fetching data: %s", err)
			return
		}
		defer res.Body.Close()

		// Read data
		body, _ := io.ReadAll(res.Body)

		// Unmarshal data
		var lines []Line
		if err := json.Unmarshal(body, &lines); err != nil {
			log.Fatal("Errore decoding JSON:", err)
		}

		// Get first line (the only one)
		var line = lines[0]

		switch dr {
		case "ongoing":
			c.JSON(200, line.Percorsi[0].Fermate)
		case "return":
			c.JSON(200, line.Percorsi[1].Fermate)
		}

	})

	// Run server
	r.Run(":8080")
}
