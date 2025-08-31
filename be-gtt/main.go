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

//
// --- MODELS ---
//

// type Vehicle struct {
// 	Id       int     `json:"id"`
// 	Tipo     string  `json:"tipo"`
// 	Disabili bool    `json:"disabili"`
// 	Lat      float64 `json:"lat"`
// 	Long     float64 `json:"lon"`
// 	Update   string  `json:"aggiornamento"`
// }

// type Stop struct {
// 	Code     string  `json:"codice"`
// 	Name     string  `json:"nome"`
// 	Lat      float64 `json:"lat"`
// 	Long     float64 `json:"lon"`
// 	Disabili bool    `json:"disabili"`
// }

// type FeatureCollection struct {
// 	Type     string    `json:"type"`
// 	Features []Feature `json:"features"`
// }

// type Feature struct {
// 	Type       string     `json:"type"`
// 	Geometry   Geometry   `json:"geometry"`
// 	Properties Properties `json:"properties"`
// }

// type Geometry struct {
// 	Type        string      `json:"type"`
// 	Coordinates interface{} `json:"coordinates"`
// }

// type Properties struct {
// 	Name      string `json:"name"`
// 	Popup     string `json:"popupContent"`
// 	Direction string `json:"direction"`
// }

// type PathStop struct {
// 	Code      string  `json:"code"`
// 	Name      string  `json:"name"`
// 	Lat       float64 `json:"lat"`
// 	Long      float64 `json:"lon"`
// 	Direction string  `json:"direction"`
// }

//
// --- MAIN ---
//

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

		c.JSON(200, rawLines)
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
