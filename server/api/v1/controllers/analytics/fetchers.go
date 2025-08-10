package analytics

import (
	"sync"
	"time"

	"github.com/RishiKendai/sot/pkg/database/postgres"
)

func fetchTopPerformingLinks(wg *sync.WaitGroup, ch chan<- []TopPerformingLink, mu *sync.Mutex, errs *[]error, userUID string, startDate, endDate string) {
	defer wg.Done()
	defer close(ch)
	topLinks := []TopPerformingLink{}

	r, err := postgres.FindMany(`
		SELECT
			a.short_link,
			l.original_link,
			COUNT(*) AS total_clicks,
			COUNT(*) FILTER (WHERE is_qr_code = TRUE) AS total_qr_clicks,
			COUNT(*) FILTER (WHERE COALESCE(referrer, '') = '') AS direct_clicks
		FROM analytics a
		JOIN links l ON a.short_link = l.short_link
		WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
		GROUP BY a.short_link, l.original_link
		ORDER BY total_clicks DESC
		LIMIT 5;
	`, userUID, startDate, endDate)

	if err != nil {
		mu.Lock()
		*errs = append(*errs, err)
		mu.Unlock()
		return
	}

	for r.Next() {
		var topLink TopPerformingLink
		err := r.Scan(&topLink.ShortLink, &topLink.OriginalLink, &topLink.TotalClicks, &topLink.QRClicks, &topLink.DirectClicks)
		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			continue
		}
		topLinks = append(topLinks, topLink)
	}

	ch <- topLinks
}

func fetchRecentActivity(wg *sync.WaitGroup, ch chan<- []RecentActivity, mu *sync.Mutex, errs *[]error, userUID, startDate, endDate string) {
	defer wg.Done()
	defer close(ch)
	recentActivities := []RecentActivity{}

	r, err := postgres.FindMany(`
		SELECT
			a.short_link,
			l.original_link,
			CASE
				WHEN a.city IS NULL OR a.city = 'Unknown' OR a.country IS NULL OR a.country = 'Unknown' OR a.city = '' OR a.country = '' THEN 'N/A'
				ELSE a.city || ', ' || a.country
			END AS location,
			a.browser || ' (' || a.device_type || ')' AS device,
			CASE
				WHEN a.is_qr_code THEN 'QR Code'
				WHEN a.referrer IS NULL THEN 'Direct Visit'
				ELSE 'External Source'
			END AS click_source,
			a.click_timestamp AS click_time
		FROM analytics a
		JOIN links l ON a.short_link = l.short_link
		WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
		ORDER BY a.click_date DESC
		LIMIT 5;
	`, userUID, startDate, endDate)

	if err != nil {
		mu.Lock()
		*errs = append(*errs, err)
		mu.Unlock()
		return
	}

	for r.Next() {
		var recent RecentActivity
		err := r.Scan(&recent.ShortLink, &recent.OriginalLink, &recent.Location, &recent.Device, &recent.ClickSource, &recent.ClickTime)
		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			continue
		}
		recentActivities = append(recentActivities, recent)
	}

	ch <- recentActivities

}

func fetchAnalyticsStats(wg *sync.WaitGroup, ch chan<- AnalyticsStats, mu *sync.Mutex, errs *[]error, userUID, startDate, endDate string) {
	defer wg.Done()
	defer close(ch)
	var analyticsStats AnalyticsStats

	var wg2 sync.WaitGroup
	hrCh := make(chan map[int]int64, 1)
	dyCh := make(chan map[string]int64, 1)
	wkCh := make(chan map[int]int64, 1)
	moCh := make(chan map[string]int64, 1)
	osCh := make(chan map[string]int64, 1)
	dvCh := make(chan map[string]int64, 1)
	brCh := make(chan map[string]int64, 1)
	geoCh := make(chan []GeographicData, 1)

	// 3. Hourly Clicks
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(hrCh)
		hourlyStats := make(map[int]int64)
		r, err := postgres.FindMany(`
			SELECT a.hour_of_day, COUNT(*) FROM analytics a 
			JOIN links l ON a.short_link = l.short_link 
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
			GROUP BY a.hour_of_day ORDER BY a.hour_of_day
	`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var hour int
			var count int64
			err := r.Scan(&hour, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			hourlyStats[hour] = count
		}
		hrCh <- hourlyStats
	}()
	// 4. Daily Clicks
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(dyCh)
		dailyStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.click_date, COUNT(*) FROM analytics a 
			JOIN links l ON a.short_link = l.short_link 
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
			GROUP BY a.click_date ORDER BY a.click_date
	`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var date time.Time
			var count int64
			err := r.Scan(&date, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			dailyStats[date.Format("2006-01-02")] = count
		}
		dyCh <- dailyStats
	}()
	// 5. Weekly Clicks
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(wkCh)
		weeklyStats := make(map[int]int64)
		r, err := postgres.FindMany(`
			SELECT a.day_of_week, COUNT(*) FROM analytics a 
			JOIN links l ON a.short_link = l.short_link 
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
			GROUP BY a.day_of_week ORDER BY a.day_of_week
	`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var day int
			var count int64
			err := r.Scan(&day, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			weeklyStats[day] = count
		}
		wkCh <- weeklyStats
	}()
	// 6. Monthly Clicks
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(moCh)
		monthlyStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.month, COUNT(*) FROM analytics a
			JOIN links l ON a.short_link = l.short_link
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
			GROUP BY a.month ORDER BY a.month
	`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}
		for r.Next() {
			var month string
			var count int64
			err := r.Scan(&month, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			monthlyStats[month] = count
		}
		moCh <- monthlyStats
	}()
	// 7. OS Stats
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(osCh)
		osStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.operating_system, COUNT(*) FROM analytics a 
			JOIN links l ON a.short_link = l.short_link 
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3 AND a.operating_system != 'Unknown'
			GROUP BY a.operating_system ORDER BY COUNT(*) DESC
		`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var os string
			var count int64
			err := r.Scan(&os, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			osStats[os] = count
		}
		osCh <- osStats
	}()
	// 8. Device Stats
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(dvCh)
		deviceStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.device_type, COUNT(*) FROM analytics a 
			JOIN links l ON a.short_link = l.short_link 
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
			GROUP BY a.device_type ORDER BY COUNT(*) DESC
		`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var device string
			var count int64
			err := r.Scan(&device, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			deviceStats[device] = count
		}
		dvCh <- deviceStats
	}()
	// 9. Browser Stats
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(brCh)
		browserStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.browser, COUNT(*) FROM analytics a
			JOIN links l ON a.short_link = l.short_link
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3
			GROUP BY a.browser ORDER BY COUNT(*) DESC
		`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var browser string
			var count int64
			err := r.Scan(&browser, &count)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			browserStats[browser] = count
		}
		brCh <- browserStats
	}()
	// 9. Geographic Stats
	wg2.Add(1)
	go func() {
		defer wg2.Done()
		defer close(geoCh)
		geographicStats := []GeographicData{}
		r, err := postgres.FindMany(`
			SELECT a.country, a.country_code, COUNT(*) as click_count
			FROM analytics a
			JOIN links l ON a.short_link = l.short_link
			WHERE l.user_uid = $1 AND a.click_date BETWEEN $2 AND $3 AND a.country != 'Unknown'
			GROUP BY a.country, a.country_code
			ORDER BY COUNT(*) DESC
		`, userUID, startDate, endDate)

		if err != nil {
			mu.Lock()
			*errs = append(*errs, err)
			mu.Unlock()
			return
		}

		for r.Next() {
			var gd GeographicData
			err := r.Scan(&gd.Country, &gd.CountryCode, &gd.ClickCount)
			if err != nil {
				mu.Lock()
				*errs = append(*errs, err)
				mu.Unlock()
				continue
			}
			geographicStats = append(geographicStats, gd)
		}
		geoCh <- geographicStats
	}()

	wg2.Wait()

	//  Collect results
	analyticsStats.HourlyStats = <-hrCh
	analyticsStats.DailyStats = <-dyCh
	analyticsStats.WeeklyStats = <-wkCh
	analyticsStats.MonthlyStats = <-moCh
	analyticsStats.OSStats = <-osCh
	analyticsStats.DeviceStats = <-dvCh
	analyticsStats.BrowserStats = <-brCh
	analyticsStats.GeographicData = <-geoCh

	if len(*errs) > 0 {
		return
	}

	ch <- analyticsStats
}
