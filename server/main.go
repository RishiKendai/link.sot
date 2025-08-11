package main

import (
	"fmt"
	"net/http"
	"time"

	apiV1 "github.com/RishiKendai/sot/api/v1"
	routes "github.com/RishiKendai/sot/api/v1/routes"
	externalV1 "github.com/RishiKendai/sot/external/v1"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/config/env"
	mongodb "github.com/RishiKendai/sot/pkg/database/mongo"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/RishiKendai/sot/service/counter"
	"github.com/RishiKendai/sot/service/cron"
	"github.com/gin-gonic/gin"
)

func init() {
	mongodb.Connect()
	postgres.Connect()
	rdb.Connect()
	counter.InitMasterCounter()
}

func main() {
	port := env.EnvPort()

	// Start analytics cron service in background
	go cron.RunWithInterval(8 * time.Second)
	fmt.Println("Cron service started")

	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	// Load HTML templates for static pages
	router.Static("/assets", "./assets")

	router.LoadHTMLGlob("templates/*.html")

	internalAPI := router.Group("/api/v1")
	{
		apiV1.RegisterRoutes(internalAPI)
	}

	// Register public short link routes (no prefix)
	routes.RegisterPublicRoutes(router)

	externalAPI := router.Group("/external/v1")
	{
		externalV1.RegisterRoutes(externalAPI)
	}

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"code":         200,
			"message":      "Hello Developer!",
			"random_joke":  "Welcome to sot API. Here's a secret: this API runs on coffee and sheer developer ingenuity. ☕💡",
			"fun_fact":     "Welcome to sot API. If you see this message, you're officially in the matrix. 🕶️🐇",
			"developed_by": "RishiKendai",
		})
	})

	router.NoRoute(func(c *gin.Context) {
		domain := env.GetEnvKey("APP_DOMAIN")
		c.HTML(http.StatusNotFound, "404.html", gin.H{
			"Domain": domain,
		})
	})

	router.Run("localhost:" + port)
}
