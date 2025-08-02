package dashboard

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/RishiKendai/sot/pkg/config/response"
	"github.com/RishiKendai/sot/pkg/database/postgres"
	"github.com/gin-gonic/gin"
)

func Dashboard() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dashboard DashboardStruct

		uid_raw, exists := c.Get("uid")
		if !exists {
			response.SendUnAuthorizedError(c, "User not authenticated", nil)
			return
		}
		uid := uid_raw.(string)

		dashboard = fetchDashboardData(uid)

		response.SendJSON(c, dashboard, nil)
	}
}

func fetchDashboardData(uid string) DashboardStruct {
	var wg sync.WaitGroup
	var dashboard DashboardStruct

	// channels for collecting results
	totalClicksCh := make(chan DashboardCount, 1)
	recentLinkStatsCh := make(chan Stats, 1)

	// Get total clicks, QR clicks, direct clicks, and unique visitors
	wg.Add(1)
	go func() {
		defer wg.Done()
		query := `SELECT
					COUNT(*) AS total_clicks,
					COUNT(*) FILTER (WHERE is_qr_code = TRUE) AS total_qr_clicks,
					COUNT(*) FILTER (WHERE COALESCE(referrer, '') = '') AS direct_clicks,
					COUNT(DISTINCT ip_address) AS unique_visitors
					FROM analytics a
					JOIN links l ON a.short_link = l.short_link
					WHERE l.user_uid = $1;
					`
		row, _ := postgres.FindOne(query, uid)
		var count DashboardCount
		row.Scan(&count.TotalClicks, &count.TotalQrClicks, &count.DirectClicks, &count.UniqueVisitors)
		fmt.Printf("Row get totals>>> : %v\n", count)
		totalClicksCh <- count
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		query := `WITH recent AS (
					SELECT   a.*,
					l.user_uid AS link_user_uid,
					l.uid AS link_uid,
					l.original_link,
					l.is_custom_backoff,
					l.created_at AS link_created_at,
					l.expiry_date,
					l.password,
					l.scan_link,
					l.is_flagged,
					l.updated_at,
					l.tags,
					l.deleted AS link_deleted
					FROM analytics a
					JOIN links l ON a.short_link = l.short_link
					WHERE l.user_uid = $1
					ORDER BY a.click_timestamp DESC
					LIMIT 1
					),
					recent_link AS (
					SELECT short_link FROM recent
					),
					clicks AS (
					SELECT * FROM analytics WHERE short_link = (SELECT short_link FROM recent_link)
					)

					SELECT
					recent.link_user_uid,
					recent.link_uid,
					recent.original_link,
					recent.short_link,
					recent.is_custom_backoff,
					recent.link_created_at,
					recent.expiry_date,
					recent.password,
					recent.scan_link,
					recent.is_flagged,
					recent.updated_at,
					recent.tags,
					recent.deleted,

					(SELECT COUNT(*) FROM clicks) AS total_clicks,
					(SELECT day_of_week FROM clicks GROUP BY day_of_week ORDER BY COUNT(*) DESC LIMIT 1) AS top_day_of_week,
					(SELECT city FROM clicks GROUP BY city ORDER BY COUNT(*) DESC LIMIT 1) AS top_city,
					(SELECT country FROM clicks GROUP BY country ORDER BY COUNT(*) DESC LIMIT 1) AS top_country,
					(SELECT browser FROM clicks GROUP BY browser ORDER BY COUNT(*) DESC LIMIT 1) AS top_browser,
					(SELECT operating_system FROM clicks GROUP BY operating_system ORDER BY COUNT(*) DESC LIMIT 1) AS top_os,
					(SELECT device_type FROM clicks GROUP BY device_type ORDER BY COUNT(*) DESC LIMIT 1) AS top_device

					FROM recent
					LIMIT 1;
					`
		row, err := postgres.FindOne(query, uid)
		if err != nil {
			fmt.Printf("Error getting stats: %v\n", err)
			return
		}
		var stats Stats
		var tagsJSON []byte
		if scanErr := row.Scan(
			&stats.User_uid,
			&stats.Uid,
			&stats.Original_url,
			&stats.Short_link,
			&stats.Is_custom_backoff,
			&stats.Created_at,
			&stats.Expiry_date,
			&stats.Password,
			&stats.Scan_link,
			&stats.Is_flagged,
			&stats.Updated_at,
			&tagsJSON,
			&stats.Deleted,
			&stats.TotalClicks,
			&stats.Top_day_of_week,
			&stats.Top_city,
			&stats.Top_country,
			&stats.Top_browser,
			&stats.Top_os,
			&stats.Top_device); scanErr != nil {
			fmt.Printf("Error scanning stats: %v\n", scanErr)
			return
		}
		if len(tagsJSON) > 0 {
			err = json.Unmarshal(tagsJSON, &stats.Tags)
			if err != nil {
				fmt.Printf("Error unMarshalling tags: %v\n", err)
				return
			}
		} else {
			stats.Tags = []string{}
		}
		fmt.Printf("Row get stats>>> : %v\n", stats)
		recentLinkStatsCh <- stats
	}()

	wg.Wait()
	close(totalClicksCh)
	close(recentLinkStatsCh)

	count := <-totalClicksCh
	dashboard.TotalClicks = count.TotalClicks
	dashboard.QRCodeClicks = count.TotalQrClicks
	dashboard.DirectClicks = count.DirectClicks
	dashboard.UniqueVisitors = count.UniqueVisitors
	stats := <-recentLinkStatsCh
	fmt.Printf("Stats: %v\n", stats)
	dashboard.Stats = stats

	return dashboard
}
