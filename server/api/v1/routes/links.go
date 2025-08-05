package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/links"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Links(router *gin.RouterGroup) {
	router.POST("/links", services.Authenticate(), links.CreateShortURLHandler())
	router.GET("/links", services.Authenticate(), links.GetLinksHandler())
	router.GET("/links/:id", services.Authenticate(), links.GetLinkHandler())
	router.PUT("/links/:id", services.Authenticate(), links.UpdateLinkHandler())
	router.DELETE("/links/:id", services.Authenticate(), links.DeleteLinkHandler())
	router.GET("/links/availability/:alias", services.Authenticate(), links.CheckAliasAvailabilityHandler())
	router.GET("/links/preview/:url", services.Authenticate(), links.PreviewHandler())
	router.GET("/links/search", services.Authenticate(), links.SearchLinksHandler())
	router.GET("/links/analytics/:uid", services.Authenticate(), links.GetLinkAnalyticsHandler())
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
