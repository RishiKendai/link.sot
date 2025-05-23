package auth

import (
	"github.com/gin-gonic/gin"
)

func IsAuthenticated() gin.HandlerFunc {
	return func(c *gin.Context) {
		// if !IsUserLoggedIn(c) {
		// 	c.Redirect(302, "/login")
		// 	c.Abort()
		// 	return
		// }
		// c.Next()
	}
}
