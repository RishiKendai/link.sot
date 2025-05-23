package rdb

import "time"

func (r *redisService) Set(key string, value any, expiration time.Duration) error {
	return r.client.Set(r.ctx, key, value, expiration).Err()
}

func (r *redisService) Get(key string) (string, error) {
	return r.client.Get(r.ctx, key).Result()
}

func (r *redisService) Del(key string) error {
	return r.client.Del(r.ctx, key).Err()
}

func (r *redisService) HSet(key, field string, value any) error {
	return r.client.HSet(r.ctx, key, field, value).Err()
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

func (r *redisService) HMSet(key string, values map[string]any) error {
	return r.client.HMSet(r.ctx, key, values).Err()
}

func (r *redisService) HMGet(key string, fields ...string) ([]any, error) {
	return r.client.HMGet(r.ctx, key, fields...).Result()
}

func (r *redisService) HIncrByFloat(key, field string, incr float64) error {
	return r.client.HIncrByFloat(r.ctx, key, field, incr).Err()
}

func (r *redisService) HKeys(key string) ([]string, error) {
	return r.client.HKeys(r.ctx, key).Result()
}
