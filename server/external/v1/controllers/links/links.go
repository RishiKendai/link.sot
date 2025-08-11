package links

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/RishiKendai/sot/service/counter"
	"github.com/gin-gonic/gin"
)

func GetLinksHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			response.SendUnAuthorizedError(c, "Unauthorized")
			return
		}

		// Query params with validation
		page := 1
		pageSize := 10
		max_pageSize := 25

		if p := c.Query("page"); p != "" {
			if _, err := fmt.Sscanf(p, "%d", &page); err != nil || page < 1 {
				page = 1
			}
		}

		if ps := c.Query("page_size"); ps != "" {
			if _, err := fmt.Sscanf(ps, "%d", &pageSize); err != nil || pageSize < 1 || pageSize > 100 {
				pageSize = 10
			}
		}

		if pageSize > max_pageSize {
			response.SendBadRequestError(c, "page_size cannot be greater than 25")
			return
		}

		offset := (page - 1) * pageSize

		var (
			total int
			links []Link
			wg    sync.WaitGroup
			errs  = make(chan error, 2)
		)

		// Run total count and data query concurrently
		wg.Add(2)

		go func() {
			defer wg.Done()
			row, err := postgres.FindOne("SELECT COUNT(*) FROM links WHERE user_uid = $1 AND deleted = false", uid)
			if err != nil {
				errs <- err
				return
			}
			if err := row.Scan(&total); err != nil {
				errs <- err
				return
			}
		}()

		go func() {
			defer wg.Done()
			query := `SELECT uid, user_uid, original_link, short_link, is_custom_backoff, created_at, expiry_date,
				password, is_flagged, updated_at, tags
				FROM links 
				WHERE user_uid = $1 AND deleted = false 
				ORDER BY created_at DESC 
				LIMIT $2 OFFSET $3`

			rows, err := postgres.FindMany(query, uid, pageSize, offset)
			if err != nil {
				errs <- err
				return
			}
			defer rows.Close()

			for rows.Next() {
				var link Link
				var tagsJSON []byte
				if err := rows.Scan(
					&link.Uid, &link.User_uid, &link.Original_url, &link.Short_link,
					&link.Is_custom_backoff, &link.Created_at, &link.Expiry_date,
					&link.Password, &link.Is_flagged, &link.Updated_at,
					&tagsJSON,
				); err != nil {
					errs <- err
					return
				}

				link.Expiry_date = link.Expiry_date.UTC()

				if len(tagsJSON) > 0 {
					if err := json.Unmarshal(tagsJSON, &link.Tags); err != nil {
						errs <- err
						return
					}
				} else {
					link.Tags = []string{}
				}

				links = append(links, link)
			}

			// Build full short link URLs efficiently in batch
			if err := buildShortLinkURLsBatch(links); err != nil {
				errs <- err
				return
			}

			// Send the response
			response := map[string]interface{}{
				"links": links,
				"pagination": gin.H{
					"total":        total,
					"count":        len(links),
					"per_page":     pageSize,
					"current_page": page,
					"total_pages":  int(math.Ceil(float64(total) / float64(pageSize))),
					"has_next":     page < int(math.Ceil(float64(total)/float64(pageSize))),
					"has_prev":     page > 1,
				},
			}
			c.JSON(http.StatusOK, response)
		}()

		wg.Wait()
		close(errs)

		if err := <-errs; err != nil {
			response.SendServerError(c, err)
			return
		}
	}
}

func CreateShortURLHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload CreateShortURLPayload

		if err := c.ShouldBindJSON(&payload); err != nil {
			response.SendBadRequestError(c, "Invalid JSON body")
			return
		}

		// Required field validation
		if strings.TrimSpace(payload.Original_url) == "" {
			response.SendBadRequestError(c, "original_url is required")
			return
		}

		// Normalize expiry to UTC
		if !payload.Expiry_date.IsZero() {
			payload.Expiry_date = payload.Expiry_date.UTC()
		}

		// Check URL safety
		isSafe, _ := CheckURLSafety(payload.Original_url)
		if !isSafe {
			payload.Is_flagged = true
			// You can block flagged URLs if desired
			// response.SendBadRequestError(c, "The provided URL is flagged as unsafe")
			// return
		}

		// Generate or use custom short code
		sc := strings.TrimSpace(payload.Custom_backoff)
		isCustom := false
		if sc == "" {
			counterVal := counter.NextCounter()
			sc = encodeBase62Fixed(counterVal, 7)
		} else {
			isCustom = true
		}

		// Get user UID from context
		uidRaw, exists := c.Get("uid")
		if !exists {
			response.SendUnAuthorizedError(c, "Unauthorized request")
			return
		}
		uid, ok := uidRaw.(string)
		if !ok || uid == "" {
			response.SendUnAuthorizedError(c, "Invalid user context")
			return
		}

		// Set expiry date (default 30 days)
		expiry := payload.Expiry_date
		if expiry.IsZero() {
			expiry = time.Now().Add(30 * 24 * time.Hour).UTC()
		}

		// Prepare insert query
		query := `
			INSERT INTO links 
			(user_uid, original_link, short_link, expiry_date, password, is_flagged, is_custom_backoff, tags)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`

		_, err := postgres.InsertOne(
			query,
			uid,
			payload.Original_url,
			sc,
			expiry,
			payload.Password,
			payload.Is_flagged,
			isCustom,
			payload.Tags,
		)
		if err != nil {
			// Custom backoff collision? Return 409 Conflict
			if strings.Contains(err.Error(), "duplicate key") {
				response.SendConflictError(c, "Custom short code already exists")
				return
			}
			response.SendServerError(c, err)
			return
		}

		// Set Redis cache
		redisExpiry := time.Hour * 5
		if diff := time.Until(expiry); diff > 0 {
			redisExpiry = diff
		}
		rdb.RC.Set(sc, payload.Original_url, &redisExpiry)

		// Return full short URL
		base := env.GetEnvKey("FE_BASE_URL")
		if base == "" {
			log.Fatal("FE_BASE_URL is not set")
		}
		shortURL := fmt.Sprintf("%s/%s", strings.TrimRight(base, "/"), sc)

		response.SendJSON(c, gin.H{
			"short_code":   sc,
			"short_url":    shortURL,
			"expires_at":   expiry.Format(time.RFC3339),
			"original_url": payload.Original_url,
		})
	}
}

func UpdateLinkHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload CreateShortURLPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			response.SendBadRequestError(c, "Invalid request body")
			return
		}

		if !payload.Expiry_date.IsZero() {
			payload.Expiry_date = payload.Expiry_date.UTC()
		}

		shortCode := c.Param("id")
		uid := c.GetString("uid")

		// Fetch existing link
		var existingLink Link
		var tagsJSON []byte
		sqlRow, err := postgres.FindOne(
			"SELECT uid, original_link, short_link, is_custom_backoff, created_at, expiry_date, password, is_flagged, updated_at, tags FROM links WHERE short_link = $1 AND user_uid = $2 AND deleted = false",
			shortCode, uid,
		)
		if err != nil {
			response.SendServerError(c, err)
			return
		}
		err = sqlRow.Scan(&existingLink.Uid, &existingLink.Original_url, &existingLink.Short_link,
			&existingLink.Is_custom_backoff, &existingLink.Created_at, &existingLink.Expiry_date, &existingLink.Password,
			&existingLink.Is_flagged, &existingLink.Updated_at, &tagsJSON,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				response.SendNotFoundError(c, "Link not found")
				return
			}
			response.SendServerError(c, err)
			return
		}
		if len(tagsJSON) > 0 {
			err = json.Unmarshal(tagsJSON, &existingLink.Tags)
			if err != nil {
				response.SendServerError(c, err)
				return
			}
		}

		newShortCode := existingLink.Short_link
		isCustom := existingLink.Is_custom_backoff

		// Handle custom short code changes
		if payload.Custom_backoff != "" && payload.Custom_backoff != existingLink.Short_link {
			isAvailable, err := IsAliasAvailable(payload.Custom_backoff, existingLink.Short_link)
			if err != nil {
				response.SendServerError(c, err)
				return
			}
			if !isAvailable {
				c.JSON(http.StatusConflict, gin.H{
					"status":  "error",
					"message": "Custom short code already exists",
				})
				return
			}
			newShortCode = payload.Custom_backoff
			isCustom = true
		} else if payload.Custom_backoff == "" && existingLink.Is_custom_backoff {
			newShortCode = encodeBase62Fixed(counter.NextCounter(), 7)
			isCustom = false
		}

		isSafe, _ := CheckURLSafety(payload.Original_url)
		if !isSafe {
			payload.Is_flagged = true
		}

		expiry := payload.Expiry_date
		if expiry.IsZero() {
			expiry = existingLink.Expiry_date.UTC()
		}

		_, err = postgres.UpdateOne(
			"UPDATE links SET original_link = $1, short_link = $2, expiry_date = $3, password = $4, is_flagged = $5, is_custom_backoff = $6, updated_at = NOW(), tags = $7 WHERE short_link = $8 AND user_uid = $9",
			payload.Original_url, newShortCode, expiry, payload.Password, payload.Is_flagged, isCustom, payload.Tags, existingLink.Short_link, uid,
		)
		if err != nil {
			response.SendServerError(c, err)
			return
		}

		// Update Redis cache
		redisExpiry := time.Hour * 5
		if diff := time.Until(expiry); diff > 0 {
			redisExpiry = diff
		}
		if newShortCode != existingLink.Short_link {
			rdb.RC.Del(existingLink.Short_link)
		}
		rdb.RC.Set(newShortCode, payload.Original_url, &redisExpiry)

		base := env.GetEnvKey("FE_BASE_URL")
		if base == "" {
			log.Fatalf("FE_BASE_URL is not set")
		}

		c.JSON(http.StatusOK, gin.H{
			"status":     "success",
			"short_link": base + "/" + newShortCode,
			"message":    "Link updated successfully",
		})
	}
}

func DeleteLinkHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		shortLinkID := c.Param("id")
		uid := c.GetString("uid")

		var shortCode string
		sqlRow, err := postgres.FindOne(
			"SELECT short_link FROM links WHERE short_link = $1 AND user_uid = $2 AND deleted = false",
			shortLinkID, uid,
		)
		if err != nil {
			response.SendServerError(c, err)
			return
		}
		err = sqlRow.Scan(&shortCode)
		if err != nil {
			if err == sql.ErrNoRows {
				response.SendNotFoundError(c, "Link not found")
				return
			}
			response.SendServerError(c, err)
			return
		}

		// Soft delete in DB
		_, err = postgres.UpdateOne(
			"UPDATE links SET deleted = TRUE WHERE short_link = $1 AND user_uid = $2",
			shortLinkID, uid,
		)
		if err != nil {
			response.SendServerError(c, err)
			return
		}
		_, err = postgres.UpdateOne(
			"UPDATE analytics SET deleted = TRUE WHERE short_link = $1 AND user_uid = $2",
			shortCode, uid,
		)
		if err != nil {
			response.SendServerError(c, err)
			return
		}

		// Clean up Redis cache
		rdb.RC.Del(shortCode)

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Link deleted successfully",
		})
	}
}
