package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/login"
	"github.com/gin-gonic/gin"
)

func Login(router *gin.RouterGroup) {
	router.POST("/login", login.Login())
}
