package routes

import (
	"github.com/RishiKendai/sot/external/v1/controllers/links"
	"github.com/RishiKendai/sot/middleware"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Links(router *gin.RouterGroup) {
	router.Use(services.ExternalAuthenticate(), middleware.ExternalRateLimiter())
	router.GET("/links", links.GetLinksHandler())
	router.POST("/links", links.CreateShortURLHandler())
	router.PUT("/links/:id", links.UpdateLinkHandler())
	router.DELETE("/links/:id", links.DeleteLinkHandler())
}
