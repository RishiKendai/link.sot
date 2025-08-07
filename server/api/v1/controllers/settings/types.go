package settings

type Profile struct {
	Name string `json:"name" binding:"required"`
}

type Password struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}
