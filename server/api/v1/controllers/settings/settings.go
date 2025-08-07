package settings

import (
	"errors"
	"log"
	"net/http"

	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
)

func UpdateProfile() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get paylaod
		uid := c.GetString("uid")
		if uid == "" {
			response.SendServerError(c, errors.New("invalid request. uid is required"), nil)
			return
		}
		var profile Profile
		if err := c.ShouldBindJSON(&profile); err != nil {
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}
		// update in postgres and update token
		result, err := postgres.UpdateOne("UPDATE users SET name = $1 WHERE uid = $2", profile.Name, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		if rowsAffected == 0 {
			response.SendBadRequestError(c, "User not found", nil)
			return
		}

		// update in redis
		rdb.RC.HSet("user:"+uid, map[string]any{
			"name": profile.Name,
		})

		// send response
		response.SendJSON(c, gin.H{
			"name": profile.Name,
		}, nil)
	}
}

func UpdatePassword() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get paylaod
		uid := c.GetString("uid")
		email := c.GetString("email")
		name := c.GetString("name")
		if uid == "" {
			response.SendServerError(c, errors.New("invalid request. uid is required"), nil)
			return
		}
		var password Password
		if err := c.ShouldBindJSON(&password); err != nil {
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}
		// Get password from postgres and check if it is correct
		r, err := postgres.FindOne("SELECT password FROM users WHERE uid = $1", uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		var pswd string
		err = r.Scan(&pswd)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		// compare passwords
		if isValid := services.CheckPasswordHash(password.OldPassword, pswd); !isValid {
			// else send error
			log.Println("Password does not match")
			response.SendBadRequestError(c, "password_mismatch", nil)
			return
		}
		// if correct update password
		hpswd, err := services.HashPassword(password.NewPassword)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		res, err := postgres.UpdateOneReturning("UPDATE users SET password = $1, token_version = token_version + 1 WHERE uid = $2 RETURNING token_version", hpswd, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		var tkv int
		err = res.Scan(&tkv)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		// update redis
		rdb.RC.HSet("user:"+uid, map[string]any{
			"token_version": tkv,
		})

		// Generate JWT
		t, err := services.GenerateJWT(uid, email, name, tkv)
		if err != nil {
			log.Println("Login controller:: ", err)
			response.SendServerError(c, err, nil)
			return
		}

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "token",
			Value:    t,
			Path:     "/",
			MaxAge:   60 * 60 * 24,
			HttpOnly: true,
			Secure:   true,
			// SameSite: http.SameSiteLaxMode,
			SameSite: http.SameSiteNoneMode,
		})

		// send response
		response.SendJSON(c, gin.H{
			"message": "Password updated successfully",
		}, nil)

	}
}
