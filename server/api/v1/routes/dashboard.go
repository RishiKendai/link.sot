package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/dashboard"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Dashboard(router *gin.RouterGroup) {
	router.Use(services.Authenticate(), middleware.InternalRateLimiter())
	router.GET("/dashboard", dashboard.Dashboard())
}
