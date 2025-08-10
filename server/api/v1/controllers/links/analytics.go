package links

import (
	"fmt"
	"sync"
	"time"

	"github.com/RishiKendai/sot/pkg/database/postgres"
)

func fetchLinkAnalytics(shortLink string) LinkAnalytics {
	var (
		la   LinkAnalytics
		wg   sync.WaitGroup
		mu   sync.Mutex
		errs []error
	)
	statCh := make(chan struct {
		TotalClicks    int
		UniqueVisitors int
		DirectClicks   int
		QR_clicks      int
	}, 1)
	lcsCh := make(chan struct {
		LastClickedAt    time.Time
		LastClickBrowser string
		LastClickDevice  string
		LastClickFrom    string
	}, 1)
	hrCh := make(chan map[int]int64, 1)
	dyCh := make(chan map[string]int64, 1)
	wkCh := make(chan map[int]int64, 1)
	moCh := make(chan map[string]int64, 1)
	osCh := make(chan map[string]int64, 1)
	devCh := make(chan map[string]int64, 1)
	brCh := make(chan map[string]int64, 1)
	geoCh := make(chan []GeographicData, 1)

	/*
		ShortLink      string           `json:"short_link"`
		TotalClicks    int              `json:"total_clicks"`
		UniqueVisitors int              `json:"unique_visitors"`
		DirectClicks   int              `json:"direct_clicks"`
		QR_clicks       int              `json:"qr_clicks"`

	*/
	// 0. Total Clicks & Unique visitors and directClick and qrClicks
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(statCh)
		var totalClicks, uniqueVisitors, directClicks, qrClicks int
		r, err := postgres.FindOne(`
				SELECT 
				COUNT(*) AS total_clicks,
				COUNT(DISTINCT ip_address) AS unique_visitors, 
				COUNT(*) FILTER (WHERE is_qr_code = TRUE) AS qr_clicks,
				COUNT(*) FILTER (WHERE COALESCE(referrer, '') = '') AS direct_clicks
				FROM analytics a
				WHERE a.short_link = $1
		`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		err = r.Scan(&totalClicks, &uniqueVisitors, &qrClicks, &directClicks)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		statCh <- struct {
			TotalClicks    int
			UniqueVisitors int
			DirectClicks   int
			QR_clicks      int
		}{
			TotalClicks:    totalClicks,
			UniqueVisitors: uniqueVisitors,
			DirectClicks:   directClicks,
			QR_clicks:      qrClicks,
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(lcsCh)

		var lastClickedAt time.Time
		var lastClickBrowser string
		var lastClickDevice string
		var lastClickFrom string
		r, err := postgres.FindOne(`
				SELECT 
				a.click_timestamp AS last_clicked_at,
				a.browser AS last_click_browser,
				CONCAT_WS(', ',
					CASE WHEN a.operating_system IS NOT NULL AND a.operating_system <> '' AND a.operating_system <> 'Unknown'
						THEN a.operating_system ELSE NULL END,
					CASE WHEN a.device_type IS NOT NULL AND a.device_type <> '' AND a.device_type <> 'Unknown'
						THEN a.device_type ELSE NULL END
				) AS last_click_device,
				CONCAT_WS(', ',
					CASE WHEN a.city IS NOT NULL AND a.city <> '' AND a.city <> 'Unknown'
						THEN a.city ELSE NULL END,
					CASE WHEN a.country IS NOT NULL AND a.country <> '' AND a.country <> 'Unknown'
						THEN a.country ELSE NULL END
				) AS last_click_from
				FROM analytics a
				WHERE a.short_link = $1
				AND (
					(a.operating_system IS NOT NULL AND a.operating_system <> '' AND a.operating_system <> 'Unknown') OR
					(a.device_type IS NOT NULL AND a.device_type <> '' AND a.device_type <> 'Unknown') OR
					(a.city IS NOT NULL AND a.city <> '' AND a.city <> 'Unknown') OR
					(a.country IS NOT NULL AND a.country <> '' AND a.country <> 'Unknown')
				)
				ORDER BY a.click_timestamp DESC
				LIMIT 1;
		`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		err = r.Scan(&lastClickedAt, &lastClickBrowser, &lastClickDevice, &lastClickFrom)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		lcsCh <- struct {
			LastClickedAt    time.Time
			LastClickBrowser string
			LastClickDevice  string
			LastClickFrom    string
		}{
			LastClickedAt:    lastClickedAt,
			LastClickBrowser: lastClickBrowser,
			LastClickDevice:  lastClickDevice,
			LastClickFrom:    lastClickFrom,
		}
	}()

	// 1. Hourly Clicks
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(hrCh)
		hourlyStats := make(map[int]int64)
		r, err := postgres.FindMany(`
			SELECT a.hour_of_day, COUNT(*) FROM analytics a
			WHERE a.short_link = $1
			GROUP BY a.hour_of_day
			ORDER BY a.hour_of_day ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var hour int
			var count int64
			err := r.Scan(&hour, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			hourlyStats[hour] = count
		}
		hrCh <- hourlyStats
	}()

	// 2. Daily Clicks
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(dyCh)
		dailyStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.click_date, COUNT(*) FROM analytics a
			WHERE a.short_link = $1
			GROUP BY a.click_date
			ORDER BY a.click_date ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var date time.Time
			var count int64
			err := r.Scan(&date, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			dailyStats[date.Format("2006-01-02")] = count
		}
		dyCh <- dailyStats
	}()

	// 3. Weekly Clicks
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(wkCh)
		weeklyStats := make(map[int]int64)
		r, err := postgres.FindMany(`
			SELECT a.day_of_week, COUNT(*) FROM analytics a
			WHERE a.short_link = $1
			GROUP BY a.day_of_week
			ORDER BY a.day_of_week ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var day int
			var count int64
			err := r.Scan(&day, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			weeklyStats[day] = count
		}
		wkCh <- weeklyStats
	}()

	// 4. Monthly Clicks
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(moCh)
		monthlyStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.month, COUNT(*) FROM analytics a
			WHERE a.short_link = $1
			GROUP BY a.month
			ORDER BY a.month ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var month string
			var count int64
			err := r.Scan(&month, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			monthlyStats[month] = count
		}
		moCh <- monthlyStats
	}()

	// 5. OS Stats
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(osCh)
		osStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.operating_system, COUNT(*) FROM analytics a
			WHERE a.short_link = $1 AND a.operating_system IS NOT NULL AND a.operating_system != 'Unknown'
			GROUP BY a.operating_system
			ORDER BY a.operating_system ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var os string
			var count int64
			err := r.Scan(&os, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			osStats[os] = count
		}
		osCh <- osStats
	}()

	// 6. Device Stats
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(devCh)
		devStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.device_type, COUNT(*) FROM analytics a
			WHERE a.short_link = $1
			GROUP BY a.device_type
			ORDER BY a.device_type ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var device string
			var count int64
			err := r.Scan(&device, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			devStats[device] = count
		}
		devCh <- devStats
	}()

	// 7. Browser Stats
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(brCh)
		brStats := make(map[string]int64)
		r, err := postgres.FindMany(`
			SELECT a.browser, COUNT(*) FROM analytics a
			WHERE a.short_link = $1
			GROUP BY a.browser
			ORDER BY a.browser ASC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var browser string
			var count int64
			err := r.Scan(&browser, &count)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			brStats[browser] = count
		}
		brCh <- brStats
	}()

	// 9. Geographic Stats
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer close(geoCh)
		geoStats := make([]GeographicData, 0)
		r, err := postgres.FindMany(`
			SELECT a.country, a.country_code, COUNT(*) as click_count
			FROM analytics a
			WHERE a.short_link = $1 AND a.country IS NOT NULL AND a.country <> 'Unknown' AND a.country <> ''
			GROUP BY a.country , a.country_code
			ORDER BY COUNT(*) DESC
	`, shortLink)
		if err != nil {
			mu.Lock()
			errs = append(errs, err)
			mu.Unlock()
			return
		}
		defer r.Close()
		for r.Next() {
			var gd GeographicData
			err := r.Scan(&gd.Country, &gd.CountryCode, &gd.ClickCount)
			if err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
				continue
			}
			geoStats = append(geoStats, gd)
		}
		geoCh <- geoStats
	}()

	wg.Wait()

	// Collect results
	la.ShortLink = shortLink
	if val, ok := <-statCh; ok {
		la.TotalClicks = val.TotalClicks
		la.UniqueVisitors = val.UniqueVisitors
		la.DirectClicks = val.DirectClicks
		la.QR_clicks = val.QR_clicks
	}
	if val, ok := <-lcsCh; ok {
		la.LastClickedAt = val.LastClickedAt
		la.LastClickBrowser = val.LastClickBrowser
		la.LastClickDevice = val.LastClickDevice
		la.LastClickFrom = val.LastClickFrom
	}
	la.HourlyStats = <-hrCh
	la.DailyStats = <-dyCh
	la.WeeklyStats = <-wkCh
	la.MonthlyStats = <-moCh
	la.OSStats = <-osCh
	la.DeviceStats = <-devCh
	la.BrowserStats = <-brCh
	la.GeographicData = <-geoCh

	if len(errs) > 0 {
		fmt.Println("Errors in fetchLinkAnalytics: ", errs)
		return la
	}

	return la
}
