package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/analytics"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Analytics(router *gin.RouterGroup) {
	router.Use(services.Authenticate(), middleware.InternalRateLimiter())
	// Get comprehensive analytics for the authenticated user
	router.GET("/analytics", analytics.GetAnalyticsHandler())

	// Get analytics for a specific link (must belong to authenticated user)
	router.GET("/analytics/link/:shortLink", analytics.GetLinkAnalyticsHandler())
}
