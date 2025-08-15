package links

import (
	"database/sql"
	"encoding/binary"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"crypto/hmac"
	"crypto/sha256"

	"github.com/PuerkitoBio/goquery"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	"github.com/gin-gonic/gin"
)

func CheckURLSafety(rawURL string) (bool, string) {
	parsedURL, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return false, "Malformed URL"
	}

	// Enforce HTTPS
	if parsedURL.Scheme != "https" {
		return false, "Only HTTPS URLs are allowed"
	}

	// Check for blocklist
	// if isBlockedDomain(parsedURL.Hostname()) {
	// 	return false, "Domain is blocklisted"
	// }

	// Heuristic checks
	// if isSuspiciousURL(parsedURL) {
	// 	return false, "URL appears suspicious"
	// }

	// Check for redirect loops or HEAD behavior
	if !isResponsiveURL(parsedURL.String()) {
		return false, "URL is unresponsive or misbehaving"
	}

	return true, ""
}

func isResponsiveURL(targetURL string) bool {
	client := http.Client{
		Timeout: 5 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return errors.New("too many redirects")
			}
			return nil
		},
	}

	req, err := http.NewRequest("HEAD", targetURL, nil)
	if err != nil {
		return false
	}

	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	// Accept 200–399 as safe
	return resp.StatusCode >= 200 && resp.StatusCode < 400
}

func IsValidURL(sot string) bool {
	_, err := url.ParseRequestURI(sot)
	return err == nil
}

func fetchMetadata(link string) (*PreviewData, error) {
	resp, err := http.Get(link)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	// Helper to get meta content
	getMeta := func(property string) string {
		content, _ := doc.Find("meta[property='" + property + "']").Attr("content")
		if content == "" {
			content, _ = doc.Find("meta[name='" + property + "']").Attr("content")
		}
		return content
	}

	parsedURL, _ := url.Parse(link)
	baseURL := parsedURL.Scheme + "://" + parsedURL.Host

	// Title
	title := doc.Find("title").Text()
	if t := getMeta("og:title"); t != "" {
		title = t
	}

	// Description
	description := getMeta("description")
	if d := getMeta("og:description"); d != "" {
		description = d
	}

	// Image
	image := getMeta("og:image")
	if image == "" {
		doc.Find("img").EachWithBreak(func(i int, s *goquery.Selection) bool {
			src, exists := s.Attr("src")
			if exists && strings.HasPrefix(src, "http") {
				image = src
				return false // break loop
			}
			return true
		})
	}
	if image != "" && strings.HasPrefix(image, "/") {
		image = baseURL + image
	}

	// Favicon
	favicon, _ := doc.Find("link[rel='icon']").Attr("href")
	if favicon == "" {
		favicon, _ = doc.Find("link[rel='shortcut icon']").Attr("href")
	}
	if favicon == "" {
		// fallback to default
		favicon = fmt.Sprintf("https://www.google.com/s2/favicons?sz=32&domain=%s", parsedURL.Host)
	} else if strings.HasPrefix(favicon, "/") {
		favicon = baseURL + favicon
	} else if !strings.HasPrefix(favicon, "http") {
		favicon = baseURL + "/" + favicon
	}

	return &PreviewData{
		Title:       title,
		Description: description,
		Image:       image,
		Favicon:     favicon,
		URL:         link,
	}, nil
}

func IsAliasAvailable(alias string, excludeShortLink string) (bool, error) {
	if len(alias) < 7 || len(alias) > 12 {
		return false, fmt.Errorf("alias must be between 7 and 12 characters long")
	}
	query := "SELECT short_link FROM links WHERE short_link = $1"
	args := []any{alias}

	// If we're excluding a specific short link (for updates), add it to the query
	if excludeShortLink != "" {
		query += " AND short_link != $2"
		args = append(args, excludeShortLink)
	}

	sqlRow, err := postgres.FindOne(query, args...)
	if err != nil {
		return false, err
	}

	var existingShortLink string
	err = sqlRow.Scan(&existingShortLink)
	if err == sql.ErrNoRows {
		return true, nil // Available
	}
	if err != nil {
		return false, err
	}

	return false, nil // Not available
}

func generateToken(shortCode string) string {
	secret := os.Getenv("JWT_SECRET")
	expiry := uint32(time.Now().Add(1 * time.Minute).Unix())

	// HMAC(secret, shortCode|expiry)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(shortCode))
	mac.Write([]byte(fmt.Sprintf("%d", expiry)))
	sig := mac.Sum(nil)[:4] // 4-byte signature

	// Pack expiry + signature
	buf := make([]byte, 8)
	binary.BigEndian.PutUint32(buf[0:4], expiry)
	copy(buf[4:], sig)

	packed := binary.BigEndian.Uint64(buf)
	return base62Encode(packed)
}

func verifyToken(token string, shortCode string) (bool, error) {
	secret := []byte(os.Getenv("JWT_SECRET"))
	packed := base62Decode(token)

	// Convert back to 8-byte buffer
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, packed)

	expiry := binary.BigEndian.Uint32(buf[0:4])
	sig := buf[4:]

	if time.Now().After(time.Unix(int64(expiry), 0)) {
		return false, errors.New("token expired")
	}

	// Recompute HMAC - must match the generation: shortCode + expiry
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(shortCode))
	mac.Write([]byte(fmt.Sprintf("%d", expiry)))
	expectedSig := mac.Sum(nil)[:4]

	return hmac.Equal(sig, expectedSig), nil
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

// buildShortLinkURL builds the complete short link URL based on user's subdomain settings
func buildShortLinkURL(userUID, shortLink string) (string, error) {
	// Check if user has subdomain enabled
	var useSubdomain bool
	var subdomain sql.NullString

	query := "SELECT use_subdomain, subdomain FROM users WHERE uid = $1"
	row, err := postgres.FindOne(query, userUID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch user subdomain settings: %w", err)
	}

	err = row.Scan(&useSubdomain, &subdomain)
	if err != nil {
		return "", fmt.Errorf("failed to scan user subdomain settings: %w", err)
	}

	// Get SOT domain from environment
	sotDomain := os.Getenv("SERVER_DOMAIN")
	if sotDomain == "" {
		panic("SERVER_DOMAIN is not set")
	}

	// Build URL based on subdomain settings
	if useSubdomain && subdomain.Valid && subdomain.String != "" {
		return fmt.Sprintf("https://%s.%s/%s", subdomain.String, sotDomain, shortLink), nil
	} else {
		return fmt.Sprintf("https://%s/%s", sotDomain, shortLink), nil
	}
}

// UserSubdomainSettings represents user subdomain configuration
type UserSubdomainSettings struct {
	UID          string
	UseSubdomain bool
	Subdomain    sql.NullString
}

// batchFetchUserSubdomainSettings fetches subdomain settings for multiple users in a single query
func batchFetchUserSubdomainSettings(userUIDs []string) (map[string]UserSubdomainSettings, error) {
	if len(userUIDs) == 0 {
		return make(map[string]UserSubdomainSettings), nil
	}

	// Create placeholders for the IN clause
	placeholders := make([]string, len(userUIDs))
	args := make([]interface{}, len(userUIDs))
	for i, uid := range userUIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = uid
	}

	query := fmt.Sprintf("SELECT uid, use_subdomain, subdomain FROM users WHERE uid IN (%s)", strings.Join(placeholders, ","))

	rows, err := postgres.FindMany(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user subdomain settings: %w", err)
	}
	defer rows.Close()

	settings := make(map[string]UserSubdomainSettings)
	for rows.Next() {
		var setting UserSubdomainSettings
		err := rows.Scan(&setting.UID, &setting.UseSubdomain, &setting.Subdomain)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user subdomain settings: %w", err)
		}
		settings[setting.UID] = setting
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over user subdomain settings: %w", err)
	}

	return settings, nil
}

// buildShortLinkURLsBatch builds complete short link URLs for multiple links efficiently
func buildShortLinkURLsBatch(links []Link) error {
	if len(links) == 0 {
		return nil
	}

	// Collect unique user UIDs
	userUIDs := make([]string, 0, len(links))
	userUIDMap := make(map[string]bool)
	for _, link := range links {
		if !userUIDMap[link.User_uid] {
			userUIDs = append(userUIDs, link.User_uid)
			userUIDMap[link.User_uid] = true
		}
	}

	// Fetch all user subdomain settings in one query
	userSettings, err := batchFetchUserSubdomainSettings(userUIDs)
	if err != nil {
		return err
	}

	// Get SOT domain from environment
	sotDomain := os.Getenv("SERVER_DOMAIN")
	if sotDomain == "" {
		panic("SERVER_DOMAIN is not set")
	}

	// Build URLs for all links
	for i := range links {
		link := &links[i]
		settings, exists := userSettings[link.User_uid]
		if !exists {
			// Fallback to default format if user not found
			link.FullShortLink = fmt.Sprintf("%s/%s", sotDomain, link.Short_link)
			continue
		}

		if settings.UseSubdomain && settings.Subdomain.Valid && settings.Subdomain.String != "" {
			link.FullShortLink = fmt.Sprintf("%s.%s/%s", settings.Subdomain.String, sotDomain, link.Short_link)
		} else {
			link.FullShortLink = fmt.Sprintf("%s/%s", sotDomain, link.Short_link)
		}
	}

	return nil
}
