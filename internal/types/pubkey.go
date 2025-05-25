package types

type SshKey struct {
	ID        string  `json:"id"`
	UserID    string  `json:"user_id"`
	Name      string  `json:"name"`
	PublicKey string  `json:"public_key"`
	Available bool    `json:"available"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
	DeletedAt *string `json:"deleted_at,omitempty" db:"deleted_at"`
}
