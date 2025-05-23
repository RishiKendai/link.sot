package register

import (
	"database/sql"
	"errors"
	"log"
	"regexp"

	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	"github.com/RishiKendai/sot/pkg/services"

	"github.com/gin-gonic/gin"
)

func validateUser(user User) error {
	// Validate user
	if user.Email == "" {
		return errors.New("email is required")
	}
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(user.Email) {
		return errors.New("invalid email address")
	}

	if user.Password == "" {
		return errors.New("password is required")
	}
	if len(user.Password) < 8 || len(user.Password) > 16 {
		return errors.New("password must be between 8 and 16 characters")
	}

	if user.Name == "" || len(user.Name) < 3 || len(user.Name) > 20 {
		return errors.New("name must be between 3 and 20 characters")
	}

	return nil
}

func Register() gin.HandlerFunc {
	return func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			log.Println("Register controller:: ", err)
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}
		// Validate User
		if err := validateUser(user); err != nil {
			response.SendBadRequestError(c, err.Error(), nil)
			return
		}
		// Email already exists
		resp, _ := postgres.FindOne("SELECT email FROM users WHERE email = $1", user.Email)
		var email string
		err := resp.Scan(&email)
		if err != nil && err != sql.ErrNoRows {
			log.Println("Register controller:: ", err)
			response.SendServerError(c, errors.New("error checking email"), nil)
			return
		}
		if email != "" {
			response.SendBadRequestError(c, "Email already exists", nil)
			return
		}
		// Hash Password
		hashedPassword, err := services.HashPassword(user.Password)
		if err != nil {
			log.Println("Register controller:: ", err)
			response.SendBadRequestError(c, "Error hashing password", nil)
			return
		}
		// Save to postgres
		resp, err = postgres.InsertOne("INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING uid", user.Email, hashedPassword, user.Name)
		if err != nil {
			log.Println("Register controller:: ", err)
			response.SendServerError(c, err, nil)
			return
		}
		// Generate JWT
		var id string
		err = resp.Scan(&id)
		if err != nil {
			log.Println("Register controller:: ", err)
			response.SendServerError(c, err, nil)
			return
		}
		token, err := services.GenerateJWT(id, user.Email)
		if err != nil {
			log.Println("Register controller:: ", err)
			response.SendServerError(c, err, nil)
			return
		}

		c.SetCookie("token", token, 3600, "/", "", false, true)

		response.SendJSON(c, gin.H{
			"name":  user.Name,
			"email": user.Email,
		}, nil)
	}
}
