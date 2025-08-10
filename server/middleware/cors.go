package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

var allowedOrigins = []string{
	"http://localhost:5173",
	"https://c5t64pql-5173.inc1.devtunnels.ms",
	"https://*.devtunnels.ms",
	"https://*.inc1.devtunnels.ms",
	// Add more VS Code port forwarding patterns
	"https://c5t64pql.inc1.devtunnels.ms:5173",
	"https://c5t64pql-5173.inc1.devtunnels.ms:5173",
}

func isAllowedOrigin(origin string) bool {
	for _, allowedOrigin := range allowedOrigins {
		if allowedOrigin == origin {
			return true
		}
		// Handle wildcard patterns for VS Code port forwarding
		if strings.Contains(allowedOrigin, "*") {
			pattern := strings.ReplaceAll(allowedOrigin, "*", "")
			if strings.Contains(origin, pattern) {
				return true
			}
		}
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

		// if c.Request.Method == "OPTIONS" {
		// 	c.AbortWithStatus(204)
		// 	return
		// }

		c.Next()
	}
}
