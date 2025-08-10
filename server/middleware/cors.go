package middleware

import (
	"strings"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/gin-gonic/gin"
)

var allowedOrigins = strings.Split(env.GetEnvKey("CORS_DOMAINS"), ",")

func isAllowedOrigin(origin string) bool {
	for _, allowedOrigin := range allowedOrigins {
		if allowedOrigin == origin {
			return true
		}
		// Handle wildcard patterns for VS Code port forwarding
		// if strings.Contains(allowedOrigin, "*") {
		// 	pattern := strings.ReplaceAll(allowedOrigin, "*", "")
		// 	if strings.Contains(origin, pattern) {
		// 		return true
		// 	}
		// }
	}
	return false
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if isAllowedOrigin(origin) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			// Fallback to localhost for development
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Location")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Strict-Origin-When-Cross-Origin", "true")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Location")

		c.Next()
	}
}
