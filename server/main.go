package main

import (
	"net/http"

	apiV1 "github.com/RishiKendai/sot/api/v1"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/config/env"
	mongodb "github.com/RishiKendai/sot/pkg/database/mongo"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/gin-gonic/gin"
)

func main() {
	port := env.EnvPort()
	mongodb.Connect()
	postgres.Connect()
	rdb.Connect()

	router := gin.Default()

	// Middleware
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.ErrorHandler)
	router.Use(middleware.SaveRequestBody)
	router.Use(middleware.RestoreRequestBody)

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

	router.Run("127.0.0.1:" + port)
}
