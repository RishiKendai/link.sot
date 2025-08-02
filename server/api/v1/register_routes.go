package apiV1

import (
	"github.com/RishiKendai/sot/api/v1/routes"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.RouterGroup) {
	routes.Register(router)
	routes.Auth(router)
	routes.Links(router)
	routes.Dashboard(router)
	routes.Analytics(router)
}
