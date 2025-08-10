package rdb

import (
	"time"

	"github.com/redis/go-redis/v9"
)

func (r *redisService) SetExpiry(key string, t time.Duration) error {
	return r.client.Expire(r.ctx, key, t).Err()
}

func (r *redisService) Set(key string, value any, expiration *time.Duration) error {
	if expiration != nil {
		return r.client.Set(r.ctx, key, value, *expiration).Err()
	}
	return r.client.Set(r.ctx, key, value, redis.KeepTTL).Err()
}

func (r *redisService) Get(key string) (string, error) {
	return r.client.Get(r.ctx, key).Result()
}

func (r *redisService) GetInt(key string) (int, error) {
	return r.client.Get(r.ctx, key).Int()
}

func (r *redisService) Del(key string) error {
	return r.client.Del(r.ctx, key).Err()
}

func (r *redisService) Exists(key string) (bool, error) {
	count, err := r.client.Exists(r.ctx, key).Result()
	return count > 0, err
}

func (r *redisService) IncrBy(key string, val int64) (int64, error) {
	return r.client.IncrBy(r.ctx, key, val).Result()
}

func (r *redisService) HSet(key string, field map[string]any) error {
	return r.client.HSet(r.ctx, key, field).Err()
}

func (r *redisService) HGet(key, field string) (string, error) {
	return r.client.HGet(r.ctx, key, field).Result()
}

func (r *redisService) HGetAll(key string) (map[string]string, error) {
	return r.client.HGetAll(r.ctx, key).Result()
}

func (r *redisService) HDel(key string, fields ...string) error {
	return r.client.HDel(r.ctx, key, fields...).Err()
}

func (r *redisService) HExists(key, field string) (bool, error) {
	return r.client.HExists(r.ctx, key, field).Result()
}

func (r *redisService) HIncrBy(key, field string, incr int64) error {
	return r.client.HIncrBy(r.ctx, key, field, incr).Err()
}

func (r *redisService) HIncrByFloat(key, field string, incr float64) error {
	return r.client.HIncrByFloat(r.ctx, key, field, incr).Err()
}

func (r *redisService) HKeys(key string) ([]string, error) {
	return r.client.HKeys(r.ctx, key).Result()
}

func (r *redisService) LPush(key string, values ...any) error {
	return r.client.LPush(r.ctx, key, values...).Err()
}

func (r *redisService) LRange(key string, start, stop int64) ([]string, error) {
	return r.client.LRange(r.ctx, key, start, stop).Result()
}

func (r *redisService) Keys(pattern string) ([]string, error) {
	return r.client.Keys(r.ctx, pattern).Result()
}

func (r *redisService) LPop(key string) (string, error) {
	return r.client.LPop(r.ctx, key).Result()
}

func (r *redisService) LLen(key string) (int64, error) {
	return r.client.LLen(r.ctx, key).Result()
}

func (r *redisService) LRem(key string, count int64, value interface{}) (int64, error) {
	return r.client.LRem(r.ctx, key, count, value).Result()
}

func (r *redisService) LTrim(key string, start, stop int64) error {
	return r.client.LTrim(r.ctx, key, start, stop).Err()
}

func (r *redisService) Scan(cursor uint64, match string, count int64) ([]string, uint64, error) {
	return r.client.Scan(r.ctx, cursor, match, count).Result()
}
