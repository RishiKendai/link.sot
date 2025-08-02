package links

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/RishiKendai/sot/pkg/services"
	"github.com/RishiKendai/sot/service/counter"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func CreateShortURLHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload CreateShortURLPayload
		if c.ShouldBindJSON(&payload) != nil {
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}
		// Ensure expiry_date is always UTC
		if !payload.Expiry_date.IsZero() {
			payload.Expiry_date = payload.Expiry_date.UTC()
		}
		if payload.Original_url == "" {
			response.SendBadRequestError(c, "URL is required", nil)
			return
		}

		// Check if URL is malicious or wrong site
		isSafe, _ := CheckURLSafety(payload.Original_url)
		if !isSafe {
			payload.Is_flagged = true
			// Optionally, you can return an error here if you want to block malicious URLs
			// response.SendBadRequestError(c, "URL is flagged", nil)
			// return
		}

		// Use custom backoff (alias) if provided, else generate
		sc := payload.Custom_backoff
		isCustomBackoff := false
		if sc == "" {
			counterVal := counter.NextCounter()
			fmt.Println("Counter: ", counterVal)
			sc = encodeBase62Fixed(counterVal, 7)
		} else {
			isCustomBackoff = true
		}
		uidRaw, exists := c.Get("uid")
		if !exists {
			response.SendServerError(c, nil, nil)
			return
		}
		uid := uidRaw.(string)

		// Prepare query and args for optional fields
		query := "INSERT INTO links (user_uid, original_link, short_link, expiry_date, password, scan_link, is_flagged, is_custom_backoff, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
		expiry := payload.Expiry_date
		if expiry.IsZero() {
			expiry = time.Now().Add(30 * 24 * time.Hour).UTC() // default 30 days, force UTC
		} else {
			expiry = expiry.UTC()
		}
		_, err := postgres.InsertOne(query, uid, payload.Original_url, sc, expiry, payload.Password, payload.Scan_link, payload.Is_flagged, isCustomBackoff, payload.Tags)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		// Set Redis with custom expiry if provided, else default 5 hours
		redisExpiry := time.Hour * 5
		if !expiry.IsZero() {
			diff := time.Until(expiry)
			if diff > 0 {
				redisExpiry = diff
			}
		}
		rdb.RC.Set(sc, payload.Original_url, redisExpiry)

		base := env.GetEnvKey("FE_BASE_URL")
		if base == "" {
			log.Fatalf("FE_BASE_URL is not set")
		}
		response.SendJSON(c, bson.M{
			"short_code": sc,
		}, nil)
	}
}

func CheckAliasAvailabilityHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if alias is available
		alias := c.Param("alias")
		isAvailable, err := IsAliasAvailable(alias, "")
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		if isAvailable {
			response.SendStatus(c, http.StatusOK)
		} else {
			response.SendStatus(c, http.StatusForbidden)
		}
	}
}

func RedirectHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("RedirectHandler >>>>>>>>>>>>>>>>>>>: ")
		sot := c.Param("sot") // or "short" depending on your route
		if sot == "" {
			response.SendBadRequestError(c, "Short link not provided", nil)
			return
		}
		isQR := c.Query("r") == "qr"
		ua := c.Request.UserAgent()
		ip := getClientIP(c)
		country := c.Request.Header.Get("CF-IPCountry")
		deviceType := c.Request.Header.Get("CF-Device-Type")
		browser := c.Request.Header.Get("CF-UA-Browser")
		os := c.Request.Header.Get("CF-UA-OS")
		ipAddress := c.Request.Header.Get("CF-Connecting-IP")
		fmt.Println("--------------------------------")
		fmt.Println("Country: ", country)
		fmt.Println("Device Type: ", deviceType)
		fmt.Println("Browser: ", browser)
		fmt.Println("OS: ", os)
		fmt.Println("IP Address: ", ipAddress, " ", ip)
		fmt.Println("--------------------------------")
		// Get link details from database
		var link Link
		var tagsJSON []byte
		sqlRow, err := postgres.FindOne("SELECT * FROM links WHERE short_link = $1", sot)
		if err != nil {
			fmt.Println("Error: >>>>>>>>>>>", err)
			response.SendServerError(c, err, nil)
			return
		}
		err = sqlRow.Scan(&link.User_uid, &link.Uid, &link.Original_url, &link.Short_link, &link.Is_custom_backoff, &link.Created_at, &link.Expiry_date, &link.Password, &link.Scan_link, &link.Is_flagged, &link.Updated_at, &tagsJSON, &link.Deleted)
		if err != nil {
			fmt.Println("Error not found: >>>>>>>>>>>", err)
			if err == sql.ErrNoRows {
				response.ServeHTMLFile(c, "link_not_found.html", 404)
				return
			}
			response.SendServerError(c, err, nil)
			return
		}
		if link.Deleted {
			response.ServeHTMLFile(c, "link_deleted.html", 410)
			return
		}
		if !link.Expiry_date.IsZero() && time.Now().UTC().After(link.Expiry_date) {
			response.ServeHTMLFile(c, "link_expired.html", 410)
			return
		}

		// Check if link is password protected
		if link.Password != nil && *link.Password != "" {
			response.ServeHTML(c, 401, "link_password.html", bson.M{
				"Error":    "",
				"Password": "",
				"Action":   "/" + link.Short_link + "/verify",
			})
			return
		}

		// Track analytics with QR code information
		referrer := c.Request.Header.Get("Referer")
		services.PushAnalytics(sot, ip, ua, isQR, referrer)

		fmt.Println("Link: ", link.Original_url)
		c.Header("Cache-Control", fmt.Sprintf("private, max-age=%d", 5*60))
		c.Header("Content-Security-Policy", "referer always;")
		c.Header("Referrer-Policy", "unsafe-url")
		c.Redirect(http.StatusMovedPermanently, link.Original_url)
		// c.Redirect(http.StatusPermanentRedirect, link.Original_url)
		// c.Redirect(http.StatusTemporaryRedirect, link.Original_url)
	}
}

func GetLinksHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		fmt.Println("UID: ", uid)

		// Pagination params
		page := 1
		pageSize := 2
		if p := c.Query("page"); p != "" {
			fmt.Sscanf(p, "%d", &page)
			if page < 1 {
				page = 1
			}
		}
		if ps := c.Query("page_size"); ps != "" {
			fmt.Sscanf(ps, "%d", &pageSize)
			if pageSize < 1 {
				pageSize = 10
			}
		}
		offset := (page - 1) * pageSize

		// Get total count
		var total int
		totalRow, err := postgres.FindOne("SELECT COUNT(*) FROM links WHERE user_uid = $1 AND deleted = false", uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		err = totalRow.Scan(&total)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		// Get paginated links
		query := "SELECT * FROM links WHERE user_uid = $1 AND deleted = false ORDER BY created_at DESC LIMIT $2 OFFSET $3"
		sqlRows, err := postgres.FindMany(query, uid, pageSize, offset)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		var links []Link
		for sqlRows.Next() {
			var link Link
			var tagsJSON []byte
			err = sqlRows.Scan(&link.User_uid, &link.Uid, &link.Original_url, &link.Short_link, &link.Is_custom_backoff, &link.Created_at, &link.Expiry_date, &link.Password, &link.Scan_link, &link.Is_flagged, &link.Updated_at, &tagsJSON, &link.Deleted)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
			// Ensure expiry_date is UTC
			link.Expiry_date = link.Expiry_date.UTC()
			// Unmarshal JSONB tags into []string
			if len(tagsJSON) > 0 {
				err = json.Unmarshal(tagsJSON, &link.Tags)
				if err != nil {
					response.SendServerError(c, err, nil)
					return
				}
			} else {
				link.Tags = []string{}
			}
			links = append(links, link)
		}
		if err = sqlRows.Err(); err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		paginated := PaginatedLinksResponse{
			Links:    links,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		}
		response.SendJSON(c, paginated, nil)
	}
}

func SearchLinksHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		query := c.Query("q")
		if query == "" {
			response.SendBadRequestError(c, "Missing search query", nil)
			return
		}

		// Pagination params
		page := 1
		pageSize := 10
		if p := c.Query("page"); p != "" {
			fmt.Sscanf(p, "%d", &page)
			if page < 1 {
				page = 1
			}
		}
		if ps := c.Query("page_size"); ps != "" {
			fmt.Sscanf(ps, "%d", &pageSize)
			if pageSize < 1 {
				pageSize = 10
			}
		}
		offset := (page - 1) * pageSize

		// Get total count for search
		totalQuery := `SELECT COUNT(*) FROM links WHERE user_uid = $1 AND (short_link ILIKE $2 OR original_link ILIKE $2) AND deleted = false`
		var total int
		totalRow, err := postgres.FindOne(totalQuery, uid, "%"+query+"%")
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		err = totalRow.Scan(&total)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		// Get paginated search results
		searchQuery := `SELECT * FROM links WHERE user_uid = $1 AND (short_link ILIKE $2 OR original_link ILIKE $2) AND deleted = false ORDER BY created_at DESC LIMIT $3 OFFSET $4`
		sqlRows, err := postgres.FindMany(searchQuery, uid, "%"+query+"%", pageSize, offset)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		defer sqlRows.Close()
		var links []Link
		for sqlRows.Next() {
			var link Link
			var tagsJSON []byte
			err = sqlRows.Scan(&link.User_uid, &link.Uid, &link.Original_url, &link.Short_link, &link.Is_custom_backoff, &link.Created_at, &link.Expiry_date, &link.Password, &link.Scan_link, &link.Is_flagged, &link.Updated_at, &tagsJSON, &link.Deleted)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
			link.Expiry_date = link.Expiry_date.UTC()
			if len(tagsJSON) > 0 {
				err = json.Unmarshal(tagsJSON, &link.Tags)
				if err != nil {
					response.SendServerError(c, err, nil)
					return
				}
			} else {
				link.Tags = []string{}
			}
			links = append(links, link)
		}
		if err = sqlRows.Err(); err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		paginated := PaginatedLinksResponse{
			Links:    links,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		}
		response.SendJSON(c, paginated, nil)
	}
}

func GetLinkHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		uid := c.GetString("uid")

		k := "links:" + id

		cd, err := rdb.RC.Get(k)

		if err == nil && len(cd) > 0 {
			d := Link{}
			err = json.Unmarshal([]byte(cd), &d)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
			response.SendJSON(c, d, nil)

			return
		}

		// Get link with user ownership check
		var link Link
		var tagsJSON []byte
		sqlRow, err := postgres.FindOne("SELECT * FROM links WHERE short_link = $1 AND user_uid = $2 AND deleted = false", id, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		err = sqlRow.Scan(&link.User_uid, &link.Uid, &link.Original_url, &link.Short_link, &link.Is_custom_backoff, &link.Created_at, &link.Expiry_date, &link.Password, &link.Scan_link, &link.Is_flagged, &link.Updated_at, &tagsJSON, &link.Deleted)
		if err != nil {
			if err == sql.ErrNoRows {
				response.SendNotFoundError(c, "Link not found", nil)
				return
			}
			response.SendServerError(c, err, nil)
			return
		}
		// Ensure expiry_date is UTC
		link.Expiry_date = link.Expiry_date.UTC()
		// Unmarshal JSONB tags into []string
		if len(tagsJSON) > 0 {
			err = json.Unmarshal(tagsJSON, &link.Tags)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
		} else {
			link.Tags = []string{}
		}
		lJSON, err := json.Marshal(link)
		rdb.RC.Set(k, lJSON, time.Minute*5)

		response.SendJSON(c, link, nil)
	}
}

func UpdateLinkHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload CreateShortURLPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}
		// Ensure expiry_date is always UTC
		if !payload.Expiry_date.IsZero() {
			payload.Expiry_date = payload.Expiry_date.UTC()
		}

		shortLinkID := c.Param("id")
		uid := c.GetString("uid")

		// First, check if the link exists and belongs to the user
		var existingLink Link
		var tagsJSON []byte
		sqlRow, err := postgres.FindOne("SELECT * FROM links WHERE short_link = $1 AND user_uid = $2 AND deleted = false", shortLinkID, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		err = sqlRow.Scan(&existingLink.User_uid, &existingLink.Uid, &existingLink.Original_url, &existingLink.Short_link, &existingLink.Is_custom_backoff, &existingLink.Created_at, &existingLink.Expiry_date, &existingLink.Password, &existingLink.Scan_link, &existingLink.Is_flagged, &existingLink.Updated_at, &tagsJSON, &existingLink.Deleted)
		if err != nil {
			if err == sql.ErrNoRows {
				response.SendNotFoundError(c, "Link not found", nil)
				return
			}
			response.SendServerError(c, err, nil)
			return
		}
		// Unmarshal JSONB tags into []string
		if len(tagsJSON) > 0 {
			err = json.Unmarshal(tagsJSON, &existingLink.Tags)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
		} else {
			existingLink.Tags = []string{}
		}

		// Handle custom back half logic
		newShortLink := existingLink.Short_link
		isCustomBackoff := existingLink.Is_custom_backoff

		// If user is trying to change the custom back half
		if payload.Custom_backoff != "" && payload.Custom_backoff != existingLink.Short_link {
			// Check if the new custom back half is available
			isAvailable, err := IsAliasAvailable(payload.Custom_backoff, existingLink.Short_link)
			if err != nil {
				response.SendServerError(c, err, nil)
				return
			}
			if !isAvailable {
				response.SendBadRequestError(c, "Custom back half already exists", nil)
				return
			}
			newShortLink = payload.Custom_backoff
			isCustomBackoff = true
		} else if payload.Custom_backoff == "" && existingLink.Is_custom_backoff {
			// If user is removing custom back half, generate a new one
			counterVal := counter.NextCounter()
			newShortLink = encodeBase62Fixed(counterVal, 7)
			isCustomBackoff = false
		}

		// Check if URL is malicious or wrong site
		isSafe, _ := CheckURLSafety(payload.Original_url)
		if !isSafe {
			payload.Is_flagged = true
		}

		// Prepare expiry date
		expiry := payload.Expiry_date
		if expiry.IsZero() {
			expiry = existingLink.Expiry_date.UTC()
		} else {
			fmt.Println("Expiry: ", expiry)
			expiry = expiry.UTC()
		}

		// Update the link in database
		query := "UPDATE links SET original_link = $1, short_link = $2, expiry_date = $3, password = $4, scan_link = $5, is_flagged = $6, is_custom_backoff = $7, updated_at = NOW(), tags = $8 WHERE short_link = $9 AND user_uid = $10"
		_, err = postgres.UpdateOne(query, payload.Original_url, newShortLink, expiry, payload.Password, payload.Scan_link, payload.Is_flagged, isCustomBackoff, payload.Tags, existingLink.Short_link, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		// Update Redis cache
		redisExpiry := time.Hour * 5
		if !expiry.IsZero() {
			diff := time.Until(expiry)
			if diff > 0 {
				redisExpiry = diff
			}
		}

		// Remove old entry from Redis if short link changed
		if newShortLink != existingLink.Short_link {
			rdb.RC.Del(existingLink.Short_link)
		}

		// Set new entry in Redis
		rdb.RC.Set(newShortLink, payload.Original_url, redisExpiry)

		base := env.GetEnvKey("FE_BASE_URL")
		if base == "" {
			log.Fatalf("FE_BASE_URL is not set")
		}

		response.SendJSON(c, bson.M{
			"short_link": base + "/api/v1/links/" + newShortLink,
			"message":    "Link updated successfully",
		}, nil)
	}
}

func DeleteLinkHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		shortLinkID := c.Param("id")
		uid := c.GetString("uid")

		// Check if the link exists and belongs to the user
		var existingLink Link
		sqlRow, err := postgres.FindOne("SELECT user_uid, uid, original_link, short_link, is_custom_backoff, created_at, expiry_date, password, scan_link, is_flagged, updated_at, deleted FROM links WHERE short_link = $1 AND user_uid = $2", shortLinkID, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		err = sqlRow.Scan(&existingLink.User_uid, &existingLink.Uid, &existingLink.Original_url, &existingLink.Short_link, &existingLink.Is_custom_backoff, &existingLink.Created_at, &existingLink.Expiry_date, &existingLink.Password, &existingLink.Scan_link, &existingLink.Is_flagged, &existingLink.Updated_at, &existingLink.Deleted)
		if err != nil {
			if err == sql.ErrNoRows {
				response.SendNotFoundError(c, "Link not found", nil)
				return
			}
			response.SendServerError(c, err, nil)
			return
		}

		// Soft delete: set deleted=true
		_, err = postgres.UpdateOne("UPDATE links SET deleted = TRUE WHERE short_link = $1 AND user_uid = $2", shortLinkID, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		// Soft delete: set deleted=true in analytics too
		_, err = postgres.UpdateOne("UPDATE analytics SET deleted = TRUE WHERE short_link = $1 AND user_uid = $2", shortLinkID, uid)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		// Remove from Redis cache
		rdb.RC.Del(shortLinkID)

		response.SendJSON(c, bson.M{
			"message": "Link deleted successfully",
		}, nil)
	}
}

func PreviewHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		url := c.Query("url")
		if !IsValidURL(url) {
			response.SendBadRequestError(c, "Invalid URL", nil)
			return
		}

		data, err := fetchMetadata(url)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		response.SendJSON(c, data, nil)
	}
}

func VerifyPasswordHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		shortLink := c.Param("sot")

		var payload PasswordVerificationPayload
		if err := c.ShouldBind(&payload); err != nil {
			fmt.Println("Error: ", err)
			response.SendBadRequestError(c, "Invalid request body", nil)
			return
		}

		// Get link details from database
		var link Link
		var tagsJSON []byte
		sqlRow, err := postgres.FindOne("SELECT * FROM links WHERE short_link = $1 AND deleted = false", shortLink)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}
		err = sqlRow.Scan(&link.User_uid, &link.Uid, &link.Original_url, &link.Short_link, &link.Is_custom_backoff, &link.Created_at, &link.Expiry_date, &link.Password, &link.Scan_link, &link.Is_flagged, &link.Updated_at, &tagsJSON, &link.Deleted)
		if err != nil {
			if err == sql.ErrNoRows {
				response.SendNotFoundError(c, "Link not found", nil)
				return
			}
			response.SendServerError(c, err, nil)
			return
		}

		// Check if link is password protected
		if link.Password == nil || *link.Password == "" {
			response.SendBadRequestError(c, "Link is not password protected", nil)
			return
		}

		// Verify password
		fmt.Println("Password: ", *link.Password, payload.Password)
		if *link.Password != payload.Password {
			// response.SendBadRequestError(c, "Incorrect password", nil)
			response.ServeHTML(c, 401, "link_password.html", bson.M{
				"Error":    "Incorrect password",
				"Password": payload.Password,
				"Action":   "/" + link.Short_link + "/verify",
			})
			return
		}

		// Check if link has expired
		if !link.Expiry_date.IsZero() && time.Now().UTC().After(link.Expiry_date) {
			response.SendBadRequestError(c, "Link has expired", nil)
			return
		}

		// Password is correct, redirect to the original URL
		// Track analytics with QR code information
		isQR := c.Query("r") == "qr"
		ua := c.Request.UserAgent()
		ip := getClientIP(c)
		sot := c.Param("sot")
		referrer := c.Request.Header.Get("Referer")
		services.PushAnalytics(sot, ip, ua, isQR, referrer)

		fmt.Println("Link: ", link.Original_url)
		c.Header("Cache-Control", fmt.Sprintf("private, max-age=%d", 5*60))
		c.Header("Content-Security-Policy", "referer always;")
		c.Header("Referrer-Policy", "unsafe-url")
		c.Redirect(http.StatusMovedPermanently, link.Original_url)
	}
}

// Utility to get real client IP from common proxy headers
func getClientIP(c *gin.Context) string {
	headers := []string{
		"CF-Connecting-IP", // Cloudflare
		"True-Client-IP",   // Akamai & others
		"X-Forwarded-For",  // Standard proxy header (can contain multiple IPs)
		"X-Real-IP",        // Nginx or other proxies
		"X-Client-IP",      // Less common
	}
	for _, h := range headers {
		ip := c.Request.Header.Get(h)
		fmt.Println("ip: >>>>>>>>>>>> ", ip)
		if ip != "" {
			// X-Forwarded-For can be a comma-separated list; take the first
			if h == "X-Forwarded-For" {
				if commaIdx := strings.Index(ip, ","); commaIdx != -1 {
					ip = ip[:commaIdx]
				}
				ip = strings.TrimSpace(ip)
			}
			return ip
		}
	}
	return c.ClientIP()
}
