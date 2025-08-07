package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/RishiKendai/sot/pkg/config/response"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/gin-gonic/gin"
)

const (
	RateLimitWindowSeconds = 60  // 1 minute
	RateLimitMaxRequests   = 100 // 100 requests per window
)

func InternalRateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		uidRaw, exists := c.Get("uid")
		if !exists {
			response.SendUnAuthorizedError(c, "User not authenticated", nil)
			c.Abort()
			return
		}
		uid := uidRaw.(string)

		// Counter key per user per window
		l, err := strconv.Atoi(env.GetEnvKey("RL_LIMIT"))
		if err != nil {
			response.SendServerError(c, fmt.Errorf("invalid RL_LIMIT: %v", l), nil)
			c.Abort()
			return
		}
		w, err := strconv.Atoi(env.GetEnvKey("RL_WINDOW"))
		if err != nil {
			response.SendServerError(c, fmt.Errorf("invalid RL_LIMIT: %v", w), nil)
			c.Abort()
			return
		}

		cntr_key := fmt.Sprintf("ratelimit:counter:%s", uid)

		// Get current count
		cntr, err := rdb.RC.GetInt(cntr_key)
		if err != nil && err.Error() != "redis: nil" {
			fmt.Println("RateLimiter Redis error: ", err)
			response.SendServerError(c, err, nil)
			c.Abort()
			return
		}

		fmt.Println("check ", cntr, l)
		if cntr >= l {
			c.Header("Retry-After", strconv.Itoa(w))
			response.SendStatus(c, http.StatusTooManyRequests)
			c.Abort()
			return
		}

		// Increment or set count
		if cntr == 0 {
			// New key – set with expiry
			expiry := time.Duration(w) * time.Second
			err = rdb.RC.Set(cntr_key, 1, &expiry)
		} else {
			// Increment – preserve expiry
			err = rdb.RC.Set(cntr_key, cntr+1, nil) // 0 = no expiry reset
		}
		if err != nil {
			fmt.Println("RateLimiter SET error: ", err)
			response.SendServerError(c, err, nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
