package settings

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/RishiKendai/sot/api/v1/model/api"
	"github.com/RishiKendai/sot/pkg/config/response"
	mongodb "github.com/RishiKendai/sot/pkg/database/mongo"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateAPIKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			response.SendServerError(c, errors.New("invalid request. uid is required"), nil)
			return
		}
		email := c.GetString("email")
		if email == "" {
			response.SendServerError(c, errors.New("invalid request. email is required"), nil)
			return
		}
		// Get payload
		var apiCreation api.APICreation
		if err := c.ShouldBindJSON(&apiCreation); err != nil {
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}
		// Create API key
		k, err := services.GenerateAPIKey(32)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		hk := services.HashAPIKey(k)

		lastSix := k[len(k)-6:]
		masked_key := "****" + lastSix

		apiCreation.Uid = uid
		apiCreation.MaskedKey = masked_key
		apiCreation.Hash = hk
		apiCreation.CreatedAt = time.Now().Unix()
		apiCreation.Status = "active"
		apiCreation.Email = email

		err = mongodb.InsertOne("api_keys", bson.M{
			"label":      apiCreation.Label,
			"uid":        apiCreation.Uid,
			"masked_key": apiCreation.MaskedKey,
			"hash":       apiCreation.Hash,
			"created_at": apiCreation.CreatedAt,
			"status":     apiCreation.Status,
			"email":      apiCreation.Email,
		})
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		response.SendJSON(c, gin.H{
			"api_key":    k,
			"label":      apiCreation.Label,
			"masked_key": apiCreation.MaskedKey,
			"created_at": apiCreation.CreatedAt,
			"status":     "active",
		}, nil)
	}
}

func GetAPIKeys() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			response.SendServerError(c, errors.New("invalid request. uid is required"), nil)
			return
		}
		var keys []api.APIKey
		fmt.Println("uid", uid)
		apiKeysDoc, err := mongodb.FindMany("api_keys", bson.M{"uid": uid})
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		if err := apiKeysDoc.All(context.TODO(), &keys); err != nil {
			log.Println("GetAPIKeys controller:: ", err.Error())
			response.SendServerError(c, err, nil)
			return
		}

		fmt.Printf("keys: %v\n", keys)
		response.SendJSON(c, gin.H{
			"api_keys": keys,
		}, nil)
	}
}

func GetAPILogs() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			response.SendServerError(c, errors.New("invalid request. uid is required"), nil)
			return
		}
		apiLogs, err := mongodb.FindMany("api_logs", bson.M{"uid": uid})
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		response.SendJSON(c, apiLogs, nil)
	}
}

func DeleteAPIKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		_id := c.Param("id")
		if uid == "" {
			response.SendServerError(c, errors.New("invalid request. uid is required"), nil)
			return
		}
		if _id == "" {
			response.SendServerError(c, errors.New("invalid request. id is required"), nil)
			return
		}

		objID, err := primitive.ObjectIDFromHex(_id)
		if err != nil {
			response.SendBadRequestError(c, "Invalid API key ID", nil)
			return
		}

		// Delete API key
		deldoc, err := mongodb.DeleteOne("api_keys", bson.M{"uid": uid, "_id": objID})
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		if deldoc.DeletedCount == 0 {
			response.SendBadRequestError(c, "API key not found", nil)
			return
		}
		response.SendJSON(c, gin.H{
			"message": "API key deleted successfully",
		}, nil)
	}
}
