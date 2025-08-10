package links

import "strings"

const base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func encodeBase62Fixed(num int64, length int) string {
	if num == 0 {
		return padLeft("0", length)
	}

	res := ""
	for num > 0 {
		res = string(base62Chars[num%62]) + res
		num /= 62
	}
	return padLeft(res, length)
}

func padLeft(str string, length int) string {
	for len(str) < length {
		str = "0" + str
	}
	return str
}

func base62Encode(num uint64) string {
	if num == 0 {
		return string(base62Chars[0])
	}
	result := ""
	for num > 0 {
		result = string(base62Chars[num%62]) + result
		num /= 62
	}
	return result
}

func base62Decode(s string) uint64 {
	var num uint64
	for _, c := range s {
		index := strings.IndexRune(base62Chars, c)
		num = num*62 + uint64(index)
	}
	return num
}
