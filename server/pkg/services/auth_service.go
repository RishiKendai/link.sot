package services

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Hash password securely
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

// Compare password with hashed value
func CheckPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

var jwtSecret = []byte(env.GetEnvKey("JWT_SECRET"))

type CustomClaims struct {
	UID          string `json:"uid"`
	Email        string `json:"email"`
	Name         string `json:"name"`
	TokenVersion int    `json:"token_version"`
	jwt.RegisteredClaims
}

// Generate JWT token
func GenerateJWT(uid, email, name string, tv int) (string, error) {
	claims := CustomClaims{
		UID:          uid,
		Email:        email,
		Name:         name,
		TokenVersion: tv,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Second)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		jt, err := c.Cookie("token")

		if err != nil || jt == "" {
			fmt.Println("err jt", err)
			response.SendUnAuthorizedError(c, "Unauthorized", nil)
			return
		}

		token, err := jwt.ParseWithClaims(jt, &CustomClaims{}, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})
		if err != nil {
			response.SendUnAuthorizedError(c, err.Error(), nil)
			return
		}

		// Get Claims
		claims, ok := token.Claims.(*CustomClaims)
		if !ok || !token.Valid {
			response.SendUnAuthorizedError(c, "Invalid token claims", nil)
			return
		}

		uid := claims.UID
		email := claims.Email
		claimed_tkv := claims.TokenVersion

		// Check in cache
		u, err := rdb.RC.HGetAll("user:" + uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		var name string
		var tkv int

		if len(u) > 0 {
			name = u["name"]
			tkv, err = strconv.Atoi(u["token_version"])
			if err != nil {
				response.SendUnAuthorizedError(c, "Corrupted token", nil)
				return
			}
		} else {
			// fallback to postgres
			row, err := postgres.FindOne("SELECT name, token_version FROM users WHERE uid = $1", uid)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
			err = row.Scan(&name, &tkv)
			if err != nil {
				response.SendUnAuthorizedError(c, "User not found", nil)
				return
			}
		}
		if tkv != claimed_tkv {
			c.SetCookie("token", "", -1, "/", "", false, true)
			response.SendUnAuthorizedError(c, "session_expired", nil)
			return
		}

		go func() {
			rdb.RC.HSet("user:"+uid, map[string]any{
				"name":          name,
				"token_version": fmt.Sprintf("%d", tkv),
			})
			rdb.RC.SetExpiry("user:"+uid, 7*24*time.Hour)
		}()

		c.Set("uid", uid)
		c.Set("email", email)
		c.Set("name", name)
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("token", token.Raw, 60*60*24, "/", "", false, true)
		c.Next()
	}
}
