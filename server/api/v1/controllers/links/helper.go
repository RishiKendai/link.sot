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
	"github.com/RishiKendai/sot/pkg/services"
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

func PushAnalytics(shortURL string, ip string, userAgent string, isQR bool) error {
	referrer := "" // You can extract this from the request if needed
	return services.PushAnalytics(shortURL, ip, userAgent, isQR, referrer)
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
	fmt.Println("Expiry: ", expiry)

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
	fmt.Println("Packed before: ", packed)
	return base62Encode(packed)
}

func verifyToken(token string, shortCode string) (bool, error) {
	secret := []byte(os.Getenv("JWT_SECRET"))
	packed := base62Decode(token)
	fmt.Println("Packed after: ", packed)

	// Convert back to 8-byte buffer
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, packed)

	expiry := binary.BigEndian.Uint32(buf[0:4])
	sig := buf[4:]

	fmt.Println("Expiry: ", time.Unix(int64(expiry), 0))
	fmt.Println("Time: ", time.Now())
	if time.Now().After(time.Unix(int64(expiry), 0)) {
		return false, errors.New("token expired")
	}

	// Recompute HMAC - must match the generation: shortCode + expiry
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(shortCode))
	mac.Write([]byte(fmt.Sprintf("%d", expiry)))
	expectedSig := mac.Sum(nil)[:4]
	fmt.Println("Expected Sig: ", expectedSig)
	fmt.Println("Sig: ", sig)

	return hmac.Equal(sig, expectedSig), nil
}
