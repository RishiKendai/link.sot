package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/links"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Links(router *gin.RouterGroup) {
	router.Use(services.Authenticate(), middleware.InternalRateLimiter())
	router.POST("/links", links.CreateShortURLHandler())
	router.GET("/links", links.GetLinksHandler())
	router.GET("/links/:id", links.GetLinkHandler())
	router.PUT("/links/:id", links.UpdateLinkHandler())
	router.DELETE("/links/:id", links.DeleteLinkHandler())
	router.GET("/links/availability/:alias", links.CheckAliasAvailabilityHandler())
	router.GET("/links/preview/:url", links.PreviewHandler())
	router.GET("/links/search", links.SearchLinksHandler())
	router.GET("/links/analytics/:uid", links.GetLinkAnalyticsHandler())
}

// RegisterPublicRoutes registers public short link handlers on the root router (no prefix)
func RegisterPublicRoutes(router *gin.Engine) {
	router.GET("/:sot", links.RedirectHandler())
	router.POST("/:sot/verify", links.VerifyPasswordHandler())
}

/*

1. Create Short URL
2. Check Alias Availability
3. Redirect to Original URL

*/
