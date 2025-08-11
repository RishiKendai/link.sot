package env

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func CheckEnv() string {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("❗Error loading .env file but will try from the environment variable")
	}
	return "success"
}

func EnvPort() string {
	CheckEnv()
	port := os.Getenv("PORT")
	if port == "" {
		fmt.Println("🥹 PORT is not set")
	}
	return port
}

func EnvPostgresURI() string {
	CheckEnv()
	uri := os.Getenv("POSTGRES_DSN")
	if uri == "" {
		fmt.Println("POSTGRES_DSN is not set")
	}
	return uri
}

func EnvMongoURI() string {
	CheckEnv()
	uri := os.Getenv("MONGO_ATLAS_ENDPOINT")
	if uri == "" {
		fmt.Println("MONGO_ATLAS_ENDPOINT is not set")
	}
	return uri
}

func EnvDbName() string {
	CheckEnv()
	db := os.Getenv("DB_NAME")
	if db == "" {
		fmt.Println("DB_NAME is not set")
	}
	return db
}

func EnvRedisURI() string {
	CheckEnv()
	uri := os.Getenv("REDIS_URI")
	if uri == "" {
		fmt.Println("REDIS_URI is not set")
	}
	return uri
}

func EnvSOTDomain() string {
	CheckEnv()
	domain := os.Getenv("SERVER_DOMAIN")
	if domain == "" {
		fmt.Println("SERVER_DOMAIN is not set")
	}
	return domain
}

func GetEnvKey(key string) string {
	CheckEnv()
	value := os.Getenv(key)
	if value == "" {
		fmt.Println(key + " is not set")
	}
	return value
}
