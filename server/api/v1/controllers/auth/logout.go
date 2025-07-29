package auth

import (
	"net/http"

	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/gin-gonic/gin"
)

func Logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.SetCookie("token", "", -1, "", "", false, true)
		response.SendStatus(c, http.StatusOK)
	}
}
