package rdb

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/RishiKendai/sot/pkg/config/env"
	"github.com/redis/go-redis/v9"
)

type redisService struct {
	client *redis.Client
	ctx    context.Context
}

var RC *redisService

func Connect() {
	// client := redis.NewClient(&redis.Options{
	// 	Addr:     env.EnvRedisURI(),
	// 	Username: "admin",
	// 	Password: env.GetEnvKey("REDIS_PASSWORD"),
	// 	DB:       0,
	// 	PoolSize: 100,
	// })

	opt, _ := redis.ParseURL(env.EnvRedisURI())
	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()

	if err != nil {
		log.Fatalf("Failed to connect to Redis: %s", err)
	}
	fmt.Println("Connected to Redis 🚀")

	RC = &redisService{
		client: client,
		ctx:    context.Background(),
	}
}
