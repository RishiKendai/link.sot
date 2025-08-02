package postgres

import "errors"

func createUser() error {
	query := `
		CREATE	TABLE IF NOT EXISTS users (
			uid UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`

	_, err := DB.Exec(query)
	if err != nil {
		return errors.New("failed to create users table: " + err.Error())
	}
	return nil
}

func createLinks() error {
	query := `
		CREATE EXTENSION IF NOT EXISTS pgcrypto;
		CREATE TABLE IF NOT EXISTS links (
			user_uid UUID NOT NULL,
			uid TEXT DEFAULT encode(gen_random_bytes(8), 'hex') PRIMARY KEY NOT NULL,
			original_link VARCHAR(255) NOT NULL,
			short_link VARCHAR(255) NOT NULL UNIQUE,
			is_custom_backoff BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			expiry_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
			password VARCHAR(255) DEFAULT NULL,
			scan_link BOOLEAN DEFAULT FALSE,
			is_flagged BOOLEAN DEFAULT FALSE,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			tags JSONB DEFAULT '[]'::jsonb,
			deleted BOOLEAN DEFAULT FALSE,
			FOREIGN KEY (user_uid) REFERENCES users(uid)
		);`

	_, err := DB.Exec(query)
	if err != nil {
		return errors.New("failed to create links table: " + err.Error())
	}
	return nil
}

func createTables() error {
	if err := createUser(); err != nil {
		return err
	}
	if err := createLinks(); err != nil {
		return err
	}
	return nil
}
