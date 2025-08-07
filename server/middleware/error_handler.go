package middleware

import (
	"fmt"

	"github.com/RishiKendai/sot/pkg/config/response"

	"github.com/gin-gonic/gin"
)

func ErrorHandler(c *gin.Context) {
	defer func() {
		if err := recover(); err != nil {
			response.SendServerError(c, fmt.Errorf("%v", err))
		}
	}()
	c.Next()
}
