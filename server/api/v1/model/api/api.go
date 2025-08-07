package api

type APICreation struct {
	Label     string `json:"label" binding:"required"`
	Uid       string `json:"uid"` // Not required from body, inferred from token
	MaskedKey string `json:"masked_key,omitempty"`
	Hash      string `json:"hash,omitempty"`       // Not received from client
	CreatedAt int64  `json:"created_at,omitempty"` // Auto-set
	Status    string `json:"status,omitempty"`     // Auto-set"` "active" | "revoked"
	Email     string `json:"email,omitempty"`      // Not required from body, inferred from token
}

type APIKey struct {
	ID        string `json:"id" bson:"_id"`
	Label     string `json:"label" bson:"label"`
	MaskedKey string `json:"masked_key" bson:"masked_key"`
	Hash      string `json:"hash" bson:"hash"`
	CreatedAt int64  `json:"created_at" bson:"created_at"`
	Status    string `json:"status" bson:"status"`
	Email     string `json:"email" bson:"email"`
}
