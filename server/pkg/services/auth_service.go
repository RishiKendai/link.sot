package services

import (
	"fmt"
	"net/http"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/RishiKendai/sot/pkg/config/response"
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

// Generate JWT token
func GenerateJWT(uid, email, name string) (string, error) {
	claims := jwt.MapClaims{
		"uid":   uid,
		"email": email,
		"name":  name,
		// "exp":   time.Now().Add(time.Hour * 24).Unix(),
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

		token, err := jwt.Parse(jt, func(t *jwt.Token) (interface{}, error) {
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
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Set("uid", claims["uid"].(string))
			c.Set("email", claims["email"].(string))
			c.Set("name", claims["name"].(string))
			c.SetSameSite(http.SameSiteLaxMode)
			c.SetCookie("token", token.Raw, 60*60*24, "/", "", false, true)
			c.Next()
			return
		}
		response.SendUnAuthorizedError(c, "Unauthorized", nil)
	}
}
