package links

import "time"

type CreateShortURLPayload struct {
	Original_url   string    `json:"original_url" binding:"required"`
	Expiry_date    time.Time `json:"expiry_date,omitempty"`
	Password       *string   `json:"password,omitempty"`
	Is_flagged     bool      `json:"is_flagged,omitempty"`
	Custom_backoff string    `json:"custom_backoff,omitempty"`
	Tags           []string  `json:"tags,omitempty"`
}

type Link struct {
	Uid               string    `json:"uid"`
	User_uid          string    `json:"user_uid"`
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
}

type PreviewData struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Favicon     string `json:"favicon"`
	URL         string `json:"url"`
}
