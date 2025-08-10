package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/RishiKendai/sot/pkg/database/postgres"
	rdb "github.com/RishiKendai/sot/pkg/database/redis"
	"github.com/oschwald/geoip2-golang"
)

// AnalyticsData represents the structure of analytics data stored in Redis
type AnalyticsData struct {
	ShortLink string `json:"short_link"`
	IP        string `json:"ip"`
	UserAgent string `json:"ua"`
	Timestamp string `json:"ts"`
	IsQR      bool   `json:"is_qr"`
	Referrer  string `json:"referrer,omitempty"`
}

// ProcessedAnalytics represents the processed analytics data for PostgreSQL
type ProcessedAnalytics struct {
	ShortLink      string
	UserUID        *string
	IPAddress      string
	UserAgent      string
	Browser        string
	BrowserVersion string
	OS             string
	OSVersion      string
	DeviceType     string
	Country        string
	CountryCode    string
	City           string
	Region         string
	Timezone       string
	Latitude       float64
	Longitude      float64
	Referrer       string
	IsQRCode       bool
	ClickTimestamp time.Time
	ClickDate      time.Time
	ClickTime      time.Time
	DayOfWeek      int
	HourOfDay      int
	WeekOfYear     int
	Month          int
	Year           int
}

// UserAgentInfo contains parsed user agent information
type UserAgentInfo struct {
	Browser        string
	BrowserVersion string
	OS             string
	OSVersion      string
	DeviceType     string
}

// GeoLocation contains geolocation information
type GeoLocation struct {
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	City        string  `json:"city"`
	Latitude    float64 `json:"lat"`
	Longitude   float64 `json:"lon"`
	Region      string  `json:"regionName"`
	Timezone    string  `json:"timezone"`
}

// PushAnalytics stores analytics data in Redis
func PushAnalytics(shortLink, ip, userAgent string, isQR bool, referrer string) error {
	data := AnalyticsData{
		ShortLink: shortLink,
		IP:        ip,
		UserAgent: userAgent,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		IsQR:      isQR,
		Referrer:  referrer,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return rdb.RC.LPush("analytics:"+shortLink, jsonData)
}

// ProcessAnalyticsData processes and stores analytics data from Redis to PostgreSQL
func ProcessAnalyticsData() error {
	// Get all analytics keys from Redis
	keys, err := rdb.RC.Keys("analytics:*")
	if err != nil {
		return fmt.Errorf("failed to get analytics keys: %v", err)
	}
	if len(keys) == 0 {
		return nil // No analytics data to process
	}

	for _, key := range keys {
		// Get all entries for this short link
		shortLink := strings.TrimPrefix(key, "analytics:")
		entries, err := rdb.RC.LRange(key, 0, -1)
		if err != nil {
			continue
		}

		// Process each entry
		for _, entry := range entries {
			var data AnalyticsData
			data.ShortLink = shortLink
			if err := json.Unmarshal([]byte(entry), &data); err != nil {
				continue
			}

			// Process the analytics data
			processed := processAnalyticsEntry(data)
			// Store in PostgreSQL
			if err := storeAnalyticsInPostgres(processed); err != nil {
				fmt.Printf("Failed to store analytics for ----------------- %s: %v\n", shortLink, err)
				continue
			}
		}

		// Remove the processed key from Redis
		rdb.RC.Del(key)
	}

	return nil
}

// processAnalyticsEntry processes a single analytics entry
func processAnalyticsEntry(data AnalyticsData) ProcessedAnalytics {
	// Parse timestamp
	timestamp, _ := time.Parse(time.RFC3339, data.Timestamp)

	// Parse user agent
	uaInfo := parseUserAgent(data.UserAgent)

	// Get geoLocation
	geoInfo := getGeoLocation(data.IP)

	// Get user UID from short link
	userUID := getUserUIDFromShortLink(data.ShortLink)

	return ProcessedAnalytics{
		ShortLink:      data.ShortLink,
		UserUID:        userUID,
		IPAddress:      data.IP,
		UserAgent:      data.UserAgent,
		Browser:        uaInfo.Browser,
		BrowserVersion: uaInfo.BrowserVersion,
		OS:             uaInfo.OS,
		OSVersion:      uaInfo.OSVersion,
		DeviceType:     uaInfo.DeviceType,
		Country:        geoInfo.Country,
		CountryCode:    geoInfo.CountryCode,
		City:           geoInfo.City,
		Region:         geoInfo.Region,
		Timezone:       geoInfo.Timezone,
		Latitude:       geoInfo.Latitude,
		Longitude:      geoInfo.Longitude,
		Referrer:       data.Referrer,
		IsQRCode:       data.IsQR,
		ClickTimestamp: timestamp,
		ClickDate:      timestamp,
		ClickTime:      timestamp,
		DayOfWeek:      int(timestamp.Weekday()),
		HourOfDay:      timestamp.Hour(),
		WeekOfYear:     func() int { _, week := timestamp.ISOWeek(); return week }(),
		Month:          int(timestamp.Month()),
		Year:           timestamp.Year(),
	}
}

// parseUserAgent parses user agent string to extract browser and OS information
func parseUserAgent(userAgent string) UserAgentInfo {
	ua := strings.ToLower(userAgent)

	info := UserAgentInfo{
		Browser:    "Unknown",
		OS:         "Unknown",
		DeviceType: "Desktop",
	}

	// Browser detection
	switch {
	case strings.Contains(ua, "chrome"):
		info.Browser = "Chrome"
		if match := regexp.MustCompile(`chrome/(\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.BrowserVersion = match[1]
		}
	case strings.Contains(ua, "firefox"):
		info.Browser = "Firefox"
		if match := regexp.MustCompile(`firefox/(\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.BrowserVersion = match[1]
		}
	case strings.Contains(ua, "safari") && !strings.Contains(ua, "chrome"):
		info.Browser = "Safari"
		if match := regexp.MustCompile(`version/(\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.BrowserVersion = match[1]
		}
	case strings.Contains(ua, "edge"):
		info.Browser = "Edge"
		if match := regexp.MustCompile(`edge/(\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.BrowserVersion = match[1]
		}
	case strings.Contains(ua, "opera"):
		info.Browser = "Opera"
		if match := regexp.MustCompile(`opera/(\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.BrowserVersion = match[1]
		}
	}

	// Operating system detection
	switch {
	case strings.Contains(ua, "windows"):
		info.OS = "Windows"
		if match := regexp.MustCompile(`windows nt (\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.OSVersion = match[1]
		}
	case strings.Contains(ua, "mac os"):
		info.OS = "macOS"
		if match := regexp.MustCompile(`mac os x (\d+[._]\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.OSVersion = strings.Replace(match[1], "_", ".", -1)
		}
	case strings.Contains(ua, "android"):
		info.OS = "Android"
		info.DeviceType = "Mobile"
		if match := regexp.MustCompile(`android (\d+\.\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.OSVersion = match[1]
		}
	case strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad"):
		info.OS = "iOS"
		info.DeviceType = "Mobile"
		if match := regexp.MustCompile(`os (\d+[._]\d+)`).FindStringSubmatch(ua); len(match) > 1 {
			info.OSVersion = strings.Replace(match[1], "_", ".", -1)
		}
	case strings.Contains(ua, "linux"):
		info.OS = "Linux"

	}

	// Device type detection
	if strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad") {
		info.DeviceType = "Mobile"
	} else if strings.Contains(ua, "tablet") || strings.Contains(ua, "ipad") {
		info.DeviceType = "Tablet"
	}

	return info
}

// get geoLocation information from IP address
func getGeoLocation(ip string) *GeoLocation {
	geo := &GeoLocation{
		Country:     "N/A",
		CountryCode: "N/A",
		City:        "N/A",
		Latitude:    0.0,
		Longitude:   0.0,
		Region:      "N/A",
		Timezone:    "+0000",
	}

	// Check in GeoLite2-country.mmdb
	p := filepath.Join("pkg", "database", "GeoLite2-City.mmdb")
	db, err := geoip2.Open(p)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// IP to lookup
	ipAddr := net.ParseIP(ip)
	// Lookup city info
	record, err := db.City(ipAddr)
	if err != nil {
		log.Fatal(err)
	}
	geo.Country = record.Country.Names["en"]
	geo.CountryCode = record.Country.IsoCode
	geo.City = record.City.Names["en"]
	geo.Region = record.Subdivisions[0].Names["en"]
	geo.Timezone = record.Location.TimeZone
	geo.Latitude = record.Location.Latitude
	geo.Longitude = record.Location.Longitude

	// Get from ipapi.co
	if geo.CountryCode == "N/A" {
		resp, err := http.Get(fmt.Sprintf("https://ipapi.co/%s/json/", ip))
		if err != nil {
			fmt.Println("Error getting geo location: ", err)
			return geo
		}

		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Printf("Error reading response body: %v\n", err)
			return geo
		}

		if err := json.Unmarshal(body, &geo); err != nil {
			fmt.Printf("Error unMarshalling geo location: %v\n", err)
			return geo
		}
	}
	return geo
}

// getUserUIDFromShortLink gets the user UID associated with a short link
func getUserUIDFromShortLink(shortLink string) *string {
	row, err := postgres.FindOne("SELECT user_uid FROM links WHERE short_link = $1", shortLink)
	if err != nil {
		return nil
	}

	var userUID string
	if err := row.Scan(&userUID); err != nil {
		return nil
	}

	return &userUID
}

// storeAnalyticsInPostgres stores processed analytics data in PostgreSQL
func storeAnalyticsInPostgres(data ProcessedAnalytics) error {
	query := `
		INSERT INTO analytics (
			short_link, user_uid, ip_address, user_agent, browser, browser_version,
			operating_system, os_version, device_type, country, country_code,
			city, region, timezone, latitude, longitude, referrer, is_qr_code, click_timestamp,
			click_date, click_time, day_of_week, hour_of_day, week_of_year,
			month, year
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
			$16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
		)
	`

	_, err := postgres.InsertOne(
		query,
		data.ShortLink, data.UserUID, data.IPAddress, data.UserAgent,
		data.Browser, data.BrowserVersion, data.OS, data.OSVersion,
		data.DeviceType, data.Country, data.CountryCode, data.City,
		data.Region, data.Timezone, data.Latitude, data.Longitude,
		data.Referrer, data.IsQRCode,
		data.ClickTimestamp, data.ClickDate, data.ClickTime,
		data.DayOfWeek, data.HourOfDay, data.WeekOfYear,
		data.Month, data.Year,
	)
	if err != nil {
		fmt.Println("Error: ", err)
	}
	return err
}
