package main

import (
	"fmt"
	"net/http"

	apiV1 "github.com/RishiKendai/sot/api/v1"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/config/env"
	mongodb "github.com/RishiKendai/sot/pkg/database/mongo"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/RishiKendai/sot/service/counter"
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
	// go cron.RunWithInterval(8 * time.Second)
	fmt.Println("Cron service started")

	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1"})
	router.Use(middleware.CORSMiddleware())

	internalAPI := router.Group("/api/v1")
	{
		apiV1.RegisterRoutes(internalAPI)
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

	router.Run("localhost:" + port)
}
