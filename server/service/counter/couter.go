package counter

import (
	"sync"
)

var (
	counter    int64
	counterEnd int64
	localMutex sync.Mutex
)

func NextCounter() int64 {
	localMutex.Lock()
	defer localMutex.Unlock()

	// If current block is exhausted, get a new one
	if counter == 0 || counter > counterEnd {
		newStart, newEnd := nextRange()
		counter = newStart
		counterEnd = newEnd
	}

	// Serve the next counter and increment
	current := counter
	counter++
	return current
}
