package analytics

import (
	"fmt"
	"sync"
	"time"

	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	"github.com/gin-gonic/gin"
)

// GetAnalyticsHandler returns comprehensive analytics data
func GetAnalyticsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userUID, exists := c.Get("uid")
		if !exists {
			response.SendUnAuthorizedError(c, "User not authenticated", nil)
			return
		}

		// Get date range from query parameters
		startDate := c.Query("start_date")
		endDate := c.Query("end_date")

		if startDate == "" {
			startDate = time.Now().AddDate(0, 0, -30).Format("2006-01-02") // Default to last 30 days
		}
		if endDate == "" {
			endDate = time.Now().Format("2006-01-02")
		}

		analytics, err := getAnalyticsSummary(userUID.(string), startDate, endDate)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		response.SendJSON(c, analytics, nil)
	}
}

// GetLinkAnalyticsHandler returns analytics for a specific link
func GetLinkAnalyticsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userUID, exists := c.Get("uid")
		if !exists {
			response.SendUnAuthorizedError(c, "User not authenticated", nil)
			return
		}

		shortLink := c.Param("shortLink")
		if shortLink == "" {
			response.SendBadRequestError(c, "Short link is required", nil)
			return
		}

		// Verify the link belongs to the user
		row, err := postgres.FindOne("SELECT short_link FROM links WHERE short_link = $1 AND user_uid = $2", shortLink, userUID)
		if err != nil {
			response.SendNotFoundError(c, "Link not found", nil)
			return
		}
		var link string
		if err := row.Scan(&link); err != nil {
			response.SendNotFoundError(c, "Link not found", nil)
			return
		}

		analytics, err := getLinkAnalytics(shortLink)
		if err != nil {
			response.SendServerError(c, err, nil)
			return
		}

		response.SendJSON(c, analytics, nil)
	}
}

// getAnalyticsSummary gets comprehensive analytics summary
func getAnalyticsSummary(userUID, startDate, endDate string) (*AnalyticsSummary, error) {
	var (
		wg        sync.WaitGroup
		mu        sync.Mutex
		analytics AnalyticsSummary
		errs      []error
	)

	// Channels for collecting results
	topLinksCh := make(chan []TopPerformingLink, 1)
	recentActivityCh := make(chan []RecentActivity, 1)
	analyticsStatsCh := make(chan AnalyticsStats, 1)

	// 1. Top Performing Links
	wg.Add(1)
	go fetchTopPerformingLinks(&wg, topLinksCh, &mu, &errs, userUID, startDate, endDate)

	// 2. Recent Links
	wg.Add(1)
	go fetchRecentActivity(&wg, recentActivityCh, &mu, &errs, userUID, startDate, endDate)

	// 3. Analytics Stats
	wg.Add(1)
	go fetchAnalyticsStats(&wg, analyticsStatsCh, &mu, &errs, userUID, startDate, endDate)

	wg.Wait()

	// Collect results
	analytics.TopPerformingLinks = <-topLinksCh
	analytics.RecentActivity = <-recentActivityCh
	analytics.AnalyticsStats = <-analyticsStatsCh

	if len(errs) > 0 {
		return nil, fmt.Errorf("multiple errors: %v", errs)
	}
	return &analytics, nil
}

// getLinkAnalytics gets analytics for a specific link
func getLinkAnalytics(shortLink string) (map[string]interface{}, error) {
	analytics := make(map[string]interface{})

	// Get total clicks for this link
	totalClicks, err := postgres.CountDocuments("SELECT COUNT(*) FROM analytics WHERE short_link = $1", shortLink)
	if err != nil {
		return nil, err
	}
	analytics["total_clicks"] = totalClicks

	// Get unique visitors for this link
	uniqueVisitors, err := postgres.CountDocuments("SELECT COUNT(DISTINCT ip_address) FROM analytics WHERE short_link = $1", shortLink)
	if err != nil {
		return nil, err
	}
	analytics["unique_visitors"] = uniqueVisitors

	// Get browser distribution
	browserStats := make(map[string]int64)
	browserRows, err := postgres.FindMany("SELECT browser, COUNT(*) FROM analytics WHERE short_link = $1 AND browser != 'Unknown' GROUP BY browser", shortLink)
	if err == nil {
		defer browserRows.Close()
		for browserRows.Next() {
			var browser string
			var count int64
			if err := browserRows.Scan(&browser, &count); err == nil {
				browserStats[browser] = count
			}
		}
	}
	analytics["browser_stats"] = browserStats

	// Get OS distribution
	osStats := make(map[string]int64)
	osRows, err := postgres.FindMany("SELECT operating_system, COUNT(*) FROM analytics WHERE short_link = $1 AND operating_system != 'Unknown' GROUP BY operating_system", shortLink)
	if err == nil {
		defer osRows.Close()
		for osRows.Next() {
			var os string
			var count int64
			if err := osRows.Scan(&os, &count); err == nil {
				osStats[os] = count
			}
		}
	}
	analytics["os_stats"] = osStats

	// Get country distribution
	countryStats := make(map[string]int64)
	countryRows, err := postgres.FindMany("SELECT country, COUNT(*) FROM analytics WHERE short_link = $1 AND country != 'Unknown' GROUP BY country", shortLink)
	if err == nil {
		defer countryRows.Close()
		for countryRows.Next() {
			var country string
			var count int64
			if err := countryRows.Scan(&country, &count); err == nil {
				countryStats[country] = count
			}
		}
	}
	analytics["country_stats"] = countryStats

	// Get device distribution
	deviceStats := make(map[string]int64)
	deviceRows, err := postgres.FindMany("SELECT device_type, COUNT(*) FROM analytics WHERE short_link = $1 GROUP BY device_type", shortLink)
	if err == nil {
		defer deviceRows.Close()
		for deviceRows.Next() {
			var device string
			var count int64
			if err := deviceRows.Scan(&device, &count); err == nil {
				deviceStats[device] = count
			}
		}
	}
	analytics["device_stats"] = deviceStats

	// Get QR code vs direct link stats
	qrStats := make(map[string]int64)
	qrRows, err := postgres.FindMany("SELECT is_qr_code, COUNT(*) FROM analytics WHERE short_link = $1 GROUP BY is_qr_code", shortLink)
	if err == nil {
		defer qrRows.Close()
		for qrRows.Next() {
			var isQR bool
			var count int64
			if err := qrRows.Scan(&isQR, &count); err == nil {
				key := "QR Code"
				if !isQR {
					key = "Direct Link"
				}
				qrStats[key] = count
			}
		}
	}
	analytics["qr_stats"] = qrStats

	return analytics, nil
}
