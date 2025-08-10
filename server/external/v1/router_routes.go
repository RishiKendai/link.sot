package externalV1

import (
	"github.com/RishiKendai/sot/external/v1/routes"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.RouterGroup) {
	routes.Links(router)
}
