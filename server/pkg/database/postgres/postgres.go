package postgres

import (
	"database/sql"
)

// InsertOne inserts a record into a table
func InsertOne(query string, args ...interface{}) (*sql.Row, error) {
	stmt, err := DB.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	return DB.QueryRow(query, args...), nil

}

// FindOne fetches a single record
func FindOne(query string, args ...interface{}) (*sql.Row, error) {
	return DB.QueryRow(query, args...), nil
}

// FindMany fetches multiple records
func FindMany(query string, args ...interface{}) (*sql.Rows, error) {
	return DB.Query(query, args...)
}

// UpdateOne updates a record in a table
func UpdateOne(query string, args ...interface{}) (sql.Result, error) {
	stmt, err := DB.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	return stmt.Exec(args...)
}

// DeleteOne deletes a record from a table
func DeleteOne(query string, args ...interface{}) (sql.Result, error) {
	stmt, err := DB.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	return stmt.Exec(args...)
}

// CountDocuments counts the number of records in a table
func CountDocuments(query string, args ...interface{}) (int, error) {
	var count int
	err := DB.QueryRow(query, args...).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
