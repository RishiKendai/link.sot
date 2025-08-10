package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/settings"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Settings(router *gin.RouterGroup) {
	// Profile
	router.PUT("/profile", services.Authenticate(), settings.UpdateProfile())
	router.GET("/domain", services.Authenticate(), settings.GetDomain())
	router.PUT("/domain", services.Authenticate(), settings.UpdateDomainSettings())
	// Security
	router.PUT("/password", services.Authenticate(), settings.UpdatePassword())

	// API
	router.POST("/api", services.Authenticate(), settings.CreateAPIKey())
	router.GET("/api", services.Authenticate(), settings.GetAPIKeys())
	router.DELETE("/api/:id", services.Authenticate(), settings.DeleteAPIKey())

}
