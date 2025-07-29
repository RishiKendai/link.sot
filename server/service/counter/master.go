package counter

import (
	"fmt"
	"log"
	"sync"

	rdb "github.com/RishiKendai/sot/pkg/database/redis"
)

var (
	blockSize   int64 = 1_000_000
	startRange  int64 = 56_800_235_584 // 62 ^ 6
	globalKey         = "counter:global"
	masterMutex sync.Mutex
)

func InitMasterCounter() {
	// Initialize Redis only if key is not already set
	exists, err := rdb.RC.Exists(globalKey)
	if err != nil {
		log.Fatalf("Redis check failed: %s", err)
	}

	if !exists {
		fmt.Println("Initializing Redis key... ", startRange, blockSize, startRange+blockSize)
		if err := rdb.RC.Set(globalKey, startRange+blockSize, 0); err != nil {
			log.Fatalf("Failed to initialize Redis key: %s", err)
		}
	}
}

func nextRange() (int64, int64) {
	masterMutex.Lock()
	defer masterMutex.Unlock()
	nextStart, err := rdb.RC.IncrBy(globalKey, blockSize)

	if err != nil {
		log.Fatalf("Failed to get next counter: %s", err)
	}

	localStart := nextStart - blockSize
	localEnd := nextStart - 1
	return localStart, localEnd
}
