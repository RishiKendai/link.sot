package dashboard

import "time"

type DashboardCount struct {
	TotalClicks    int64
	TotalQrClicks  int64
	DirectClicks   int64
	UniqueVisitors int64
}

type DashboardStruct struct {
	TotalClicks    int64 `json:"total_clicks"`
	QRCodeClicks   int64 `json:"qr_clicks"`
	DirectClicks   int64 `json:"direct_clicks"`
	UniqueVisitors int64 `json:"unique_visitors"`
	Stats          Stats `json:"stats"`
}

type Stats struct {
	Uid               string    `json:"uid"`
	User_uid          string    `json:"user_uid"`
	Original_url      string    `json:"original_url"`
	Short_link        string    `json:"short_link"`
	Is_custom_backoff bool      `json:"is_custom_backoff"`
	Created_at        time.Time `json:"created_at"`
	Expiry_date       time.Time `json:"expiry_date"`
	Password          *string   `json:"password"`
	Scan_link         bool      `json:"scan_link"`
	Is_flagged        bool      `json:"is_flagged"`
	Updated_at        time.Time `json:"updated_at"`
	Tags              []string  `json:"tags"`
	Deleted           bool      `json:"deleted"`
	TotalClicks       int64     `json:"total_clicks"`
	Top_day_of_week   int64     `json:"top_day_of_week"`
	Top_city          string    `json:"top_city"`
	Top_country       string    `json:"top_country"`
	Top_browser       string    `json:"top_browser"`
	Top_os            string    `json:"top_os"`
	Top_device        string    `json:"top_device"`
}
