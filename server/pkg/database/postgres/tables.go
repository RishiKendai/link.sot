package postgres

import "errors"

func createUser() error {
	query := `
		CREATE	TABLE IF NOT EXISTS users (
			uid UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			subdomain VARCHAR(255) DEFAULT NULL,
			use_subdomain BOOLEAN DEFAULT FALSE,
			token_version INTEGER DEFAULT 1,
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

func createAnalytics() error {
	query := `
		CREATE TABLE IF NOT EXISTS analytics (
			id SERIAL PRIMARY KEY,
			short_link VARCHAR(255) NOT NULL,
			user_uid UUID,
			ip_address VARCHAR(45),
			user_agent TEXT,
			browser VARCHAR(100),
			browser_version VARCHAR(50),
			operating_system VARCHAR(100),
			os_version VARCHAR(50),
			device_type VARCHAR(50),
			country VARCHAR(100),
			country_code VARCHAR(10),
			city VARCHAR(100),
			region VARCHAR(100),
			timezone VARCHAR(100),
			latitude FLOAT,
			longitude FLOAT,
			referrer TEXT,
			is_qr_code BOOLEAN DEFAULT FALSE,
			click_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			click_date DATE DEFAULT CURRENT_DATE,
			click_time TIME DEFAULT CURRENT_TIME,
			day_of_week INTEGER,
			hour_of_day INTEGER,
			week_of_year INTEGER,
			month INTEGER,
			year INTEGER,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE
		);
		
		-- Create indexes for better query performance
		CREATE INDEX IF NOT EXISTS idx_analytics_short_link ON analytics(short_link);
		CREATE INDEX IF NOT EXISTS idx_analytics_user_uid ON analytics(user_uid);
		CREATE INDEX IF NOT EXISTS idx_analytics_click_timestamp ON analytics(click_timestamp);
		CREATE INDEX IF NOT EXISTS idx_analytics_browser ON analytics(browser);
		CREATE INDEX IF NOT EXISTS idx_analytics_os ON analytics(operating_system);
		CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);
		CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type);
		CREATE INDEX IF NOT EXISTS idx_analytics_day_of_week ON analytics(day_of_week);
		CREATE INDEX IF NOT EXISTS idx_analytics_hour_of_day ON analytics(hour_of_day);
		CREATE INDEX IF NOT EXISTS idx_analytics_click_date ON analytics(click_date);
		CREATE INDEX IF NOT EXISTS idx_analytics_is_qr_code ON analytics(is_qr_code);
	`

	_, err := DB.Exec(query)
	if err != nil {
		return errors.New("failed to create analytics table: " + err.Error())
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
	if err := createAnalytics(); err != nil {
		return err
	}
	return nil
}
