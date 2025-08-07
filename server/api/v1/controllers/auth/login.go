package auth

import (
	"database/sql"
	"errors"
	"log"
	"net/http"

	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	"github.com/RishiKendai/sot/pkg/services"

	"github.com/gin-gonic/gin"
)

func validateUser(user User) error {
	if user.Email == "" {
		return errors.New("email is required")
	}
	if user.Password == "" {
		return errors.New("password is required")
	}
	return nil
}

func Login() gin.HandlerFunc {
	return func(c *gin.Context) {

		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			log.Println("Login controller:: ", err)
			response.SendBadRequestError(c, "Invalid request body")
			return
		}

		// Validate User
		if err := validateUser(user); err != nil {
			response.SendBadRequestError(c, err.Error())
			return
		}

		// Check if user exists
		row, err := postgres.FindOne("SELECT uid, name,email, password, token_version FROM users WHERE email = $1", user.Email)

		if err != nil {
			log.Println("Login controller:: ", err)
			response.SendServerError(c, err)
			return
		}
		var uid, name, email, password string
		var tkv int
		err = row.Scan(&uid, &name, &email, &password, &tkv)
		if err != nil {
			if err == sql.ErrNoRows {
				log.Println("Login controller:: ", err)
				response.SendNotFoundError(c, "Invalid username or password.")
				return
			}
			log.Println("Login controller:: ", err)
			response.SendServerError(c, err)
			return
		}

		// Check if password is correct
		if err := services.CheckPasswordHash(user.Password, password); !err {
			log.Println("Login controller:: ", err)
			response.SendBadRequestError(c, "Invalid password.")
			return
		}

		// Generate JWT
		token, err := services.GenerateJWT(uid, email, name, tkv)
		if err != nil {
			log.Println("Login controller:: ", err)
			response.SendServerError(c, err)
			return
		}

		// c.SetCookie("token", token, 60*60*24, "/", "", false, true)
		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "token",
			Value:    token,
			Path:     "/",
			MaxAge:   60 * 60 * 24,
			HttpOnly: true,
			Secure:   true,
			// SameSite: http.SameSiteLaxMode,
			SameSite: http.SameSiteNoneMode,
		})
		response.SendJSON(c, gin.H{
			"email": email,
			"name":  name,
		})
	}
}
