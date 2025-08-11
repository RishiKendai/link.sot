package links

import "time"

type CreateShortURLPayload struct {
	Original_url   string    `json:"original_url"`
	Expiry_date    time.Time `json:"expiry_date"`
	Password       *string   `json:"password"`
	Is_flagged     bool      `json:"is_flagged"`
	Custom_backoff string    `json:"custom_backoff"`
	Tags           []string  `json:"tags"`
}

type PasswordVerificationPayload struct {
	Password string `json:"password" form:"password"`
}

type Link struct {
	User_uid          string    `json:"user_uid"`
	Uid               string    `json:"uid"`
	Original_url      string    `json:"original_url"`
	Short_link        string    `json:"short_link"`
	FullShortLink     string    `json:"full_short_link"`
	Created_at        time.Time `json:"created_at"`
	Expiry_date       time.Time `json:"expiry_date"`
	Password          *string   `json:"password"`
	Is_flagged        bool      `json:"is_flagged"`
	Is_custom_backoff bool      `json:"is_custom_backoff"`
	Updated_at        time.Time `json:"updated_at"`
	Tags              []string  `json:"tags"`
	Deleted           bool      `json:"deleted"`
}

type PreviewData struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Favicon     string `json:"favicon"`
	URL         string `json:"url"`
}

type PaginatedLinksResponse struct {
	Links    []Link `json:"links"`
	Total    int    `json:"total"`
	Page     int    `json:"page"`
	PageSize int    `json:"page_size"`
}

type LinkAnalytics struct {
	ShortLink           string           `json:"short_link"`
	FullShortLink       string           `json:"full_short_link"` // Added field for complete short link URL
	OriginalURL         string           `json:"original_link"`
	TotalClicks         int              `json:"total_clicks"`
	UniqueVisitors      int              `json:"unique_visitors"`
	DirectClicks        int              `json:"direct_clicks"`
	QR_clicks           int              `json:"qr_clicks"`
	CreatedOn           time.Time        `json:"created_on"`
	ExpiriesOn          time.Time        `json:"expiries_on"`
	IsPasswordProtected bool             `json:"is_password_protected"`
	LastClickedAt       time.Time        `json:"last_clicked_at"`
	LastClickBrowser    string           `json:"last_click_browser"`
	LastClickDevice     string           `json:"last_click_device"`
	LastClickFrom       string           `json:"last_click_from"`
	HourlyStats         map[int]int64    `json:"hourly_stats"`
	DailyStats          map[string]int64 `json:"daily_stats"`
	WeeklyStats         map[int]int64    `json:"weekly_stats"`
	MonthlyStats        map[string]int64 `json:"monthly_stats"`
	OSStats             map[string]int64 `json:"os_stats"`
	DeviceStats         map[string]int64 `json:"device_stats"`
	BrowserStats        map[string]int64 `json:"browser_stats"`
	GeographicData      []GeographicData `json:"geographic_data"`
}

type GeographicData struct {
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	ClickCount  int64  `json:"click_count"`
}
