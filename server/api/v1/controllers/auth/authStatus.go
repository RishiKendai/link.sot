package auth

import (
	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/gin-gonic/gin"
)

func AuthStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		email := c.GetString("email")
		name := c.GetString("name")
		response.SendJSON(c, gin.H{
			"email": email,
			"name":  name,
		}, nil)
	}
}
