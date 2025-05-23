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
		CREATE TABLE IF NOT EXISTS links (
			user_uid UUID NOT NULL,
			original_link VARCHAR(255) NOT NULL,
			short_link VARCHAR(255) NOT NULL UNIQUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
