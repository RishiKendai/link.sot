package analytics

type TopPerformingLink struct {
	ShortLink     string `json:"short_link"`
	FullShortLink string `json:"full_short_link"` // Added field for complete short link URL
	OriginalLink  string `json:"original_link"`
	TotalClicks   int64  `json:"total_clicks"`
	QRClicks      int64  `json:"qr_clicks"`
	DirectClicks  int64  `json:"direct_clicks"`
}

type RecentActivity struct {
	ShortLink     string `json:"short_link"`
	FullShortLink string `json:"full_short_link"` // Added field for complete short link URL
	OriginalLink  string `json:"original_link"`
	Location      string `json:"location"`     // City, Country
	Device        string `json:"device"`       // Browser, Device type
	ClickSource   string `json:"click_source"` // Direct Visit | QR Code | External Source
	ClickTime     string `json:"click_time"`   // Timestamp of the click May 23, 2025 at 1:23 PM
}

type AnalyticsStats struct {
	HourlyStats    map[int]int64    `json:"hourly_stats"`
	DailyStats     map[string]int64 `json:"daily_stats"`
	WeeklyStats    map[int]int64    `json:"weekly_stats"`
	MonthlyStats   map[string]int64 `json:"monthly_stats"`
	OSStats        map[string]int64 `json:"os_stats"`
	DeviceStats    map[string]int64 `json:"device_stats"`
	BrowserStats   map[string]int64 `json:"browser_stats"`
	GeographicData []GeographicData `json:"geographic_data"`
}

type GeographicData struct {
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	ClickCount  int64  `json:"click_count"`
}

type AnalyticsSummary struct {
	TopPerformingLinks []TopPerformingLink `json:"top_performing_links"`
	RecentActivity     []RecentActivity    `json:"recent_activity"`
	AnalyticsStats     AnalyticsStats      `json:"analytics_stats"`
}
