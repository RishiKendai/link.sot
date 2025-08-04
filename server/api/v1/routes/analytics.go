package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/analytics"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Analytics(router *gin.RouterGroup) {
	// Get comprehensive analytics for the authenticated user
	router.GET("/analytics", services.Authenticate(), analytics.GetAnalyticsHandler())

	// Get analytics for a specific link (must belong to authenticated user)
	router.GET("/analytics/link/:shortLink", services.Authenticate(), analytics.GetLinkAnalyticsHandler())
}
