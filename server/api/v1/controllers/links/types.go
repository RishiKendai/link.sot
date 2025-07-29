package links

import "time"

type CreateShortURLPayload struct {
	Original_url   string    `json:"original_url"`
	Expiry_date    time.Time `json:"expiry_date"`
	Password       *string   `json:"password"`
	Scan_link      bool      `json:"scan_link"`
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
	Created_at        time.Time `json:"created_at"`
	Expiry_date       time.Time `json:"expiry_date"`
	Password          *string   `json:"password"`
	Scan_link         bool      `json:"scan_link"`
	Is_flagged        bool      `json:"is_flagged"`
	Is_custom_backoff bool      `json:"is_custom_backoff"`
	Updated_at        time.Time `json:"updated_at"`
	Tags              []string  `json:"tags"`
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
