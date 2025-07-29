package routes

import (
	"github.com/RishiKendai/sot/api/v1/controllers/auth"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func Auth(router *gin.RouterGroup) {
	router.POST("/login", auth.Login())
	router.POST("/logout", auth.Logout())
	router.GET("/auth-status", services.Authenticate(), auth.AuthStatus())
}
