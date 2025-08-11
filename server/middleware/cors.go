package middleware

import (
	"github.com/gin-gonic/gin"
)

// var allowedOrigins = strings.Split(env.GetEnvKey("CORS_DOMAINS"), ",")

// func isAllowedOrigin(origin string) bool {
// 	return slices.Contains(allowedOrigins, origin)
// }

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// origin := c.Request.Header.Get("Origin")

		// if isAllowedOrigin(origin) {
		// 	c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		// } else {
		// 	// Fallback to localhost for development
		// 	c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		// }
		c.Writer.Header().Set("Access-Control-Allow-Origin", "https://app.linksot.space/")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Location")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Strict-Origin-When-Cross-Origin", "true")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Location")

		c.Next()
	}
}
