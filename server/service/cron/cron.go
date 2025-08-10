package cron

import (
	"log"
	"time"

	"github.com/RishiKendai/sot/pkg/services"
)

// Run starts the cron service that processes analytics data
func Run() {
	log.Println("Starting analytics cron service...")

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if err := services.ProcessAnalyticsData(); err != nil {
			log.Printf("Error processing analytics data: %v", err)
		}
	}
}

// RunWithInterval starts the cron service with a custom interval
func RunWithInterval(interval time.Duration) {
	log.Printf("Starting analytics cron service with interval: %v", interval)

	if err := services.ProcessAnalyticsData(); err != nil {
		log.Printf("Error processing analytics data: %v", err)
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		if err := services.ProcessAnalyticsData(); err != nil {
			log.Printf("Error processing analytics data: %v", err)
		}
	}
}
