package postgres

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/RishiKendai/sot/pkg/config/env"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

func Connect() {
	var err error

	dsn := env.GetEnvKey("POSTGRES_DSN")
	if dsn == "" {
		log.Fatal("POSTGRES_DSN is not set ❌")
	}
	DB, err = sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("❌ Error connecting to Neon PostgreSQL: %v", err)
	}

	// Set connection pool settings
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(10)
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err = DB.Ping(); err != nil {
		log.Fatalf("❌ Error pinging Neon PostgreSQL: %v", err)
	}

	fmt.Println("Connected to Neon PostgreSQL 🐘")
	if err := createTables(); err != nil {
		log.Fatalf("❌ Error creating tables: %v", err)
	}
}

func CLose() {
	if DB != nil {
		DB.Close()
		fmt.Println("🔌 PostgreSQL connection closed.")
	}
}
