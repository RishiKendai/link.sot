package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/register"
	"github.com/gin-gonic/gin"
)

func Register(router *gin.RouterGroup) {
	router.POST("/register", register.Register())
}
