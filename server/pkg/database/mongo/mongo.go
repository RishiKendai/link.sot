package mongodb

import (
	"context"
	"fmt"

	"github.com/RishiKendai/sot/pkg/config/env"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Database string = env.EnvDbName()

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	collection := client.Database(Database).Collection(collectionName)
	return collection
}

func ListCollections() {
	client, _ := DB.Database(Database).ListCollectionNames(context.TODO(), bson.M{})
	for _, collection := range client {
		fmt.Println(collection)
	}
}

func InsertOne(collection string, document interface{}) error {
	collectionCtx := DB.Database(Database).Collection(collection)
	_, err := collectionCtx.InsertOne(context.TODO(), document)
	return err
}

func InsertMany(collection string, documents []interface{}) error {
	collectionCtx := DB.Database(Database).Collection(collection)
	_, err := collectionCtx.InsertMany(context.TODO(), documents)
	return err
}

func Find(collection string, filter interface{}, option ...*options.FindOptions) (*mongo.Cursor, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	return collectionCtx.Find(context.TODO(), filter, option...)
}

func FindOne(collection string, filter interface{}, options ...*options.FindOneOptions) *mongo.SingleResult {
	collectionCtx := DB.Database(Database).Collection(collection)
	result := collectionCtx.FindOne(context.TODO(), filter, options...)
	return result
}

func FindMany(collection string, filter interface{}, option ...*options.FindOptions) (*mongo.Cursor, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	return collectionCtx.Find(context.TODO(), filter, option...)
}

func UpdateOne(collection string, filter interface{}, update interface{}, options ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	return collectionCtx.UpdateOne(context.TODO(), filter, update, options...)
}

func UpdateMany(collection string, filter interface{}, update interface{}) (*mongo.UpdateResult, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	return collectionCtx.UpdateMany(context.TODO(), filter, update)
}

func DeleteOne(collection string, filter interface{}) (*mongo.DeleteResult, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	return collectionCtx.DeleteOne(context.TODO(), filter)
}

func DeleteMany(collection string, filter interface{}) (*mongo.DeleteResult, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	return collectionCtx.DeleteMany(context.TODO(), filter)
}

func CheckIfFieldExists(collection string, filter interface{}, field string) bool {
	collectionCtx := DB.Database(Database).Collection(collection)
	var result bson.M
	err := collectionCtx.FindOne(context.Background(), filter).Decode(&result)
	if err != nil {
		return false
	}
	if result[field] != nil {
		return true
	}
	return false
}

func CountDocuments(collection string, filter interface{}) (int64, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	count, err := collectionCtx.CountDocuments(context.TODO(), filter)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func Aggregate(collection string, pipeline any) ([]bson.M, error) {
	collectionCtx := DB.Database(Database).Collection(collection)
	var data []bson.M

	cursor, err := collectionCtx.Aggregate(context.TODO(), pipeline)

	if err != nil {
		return nil, err
	}

	cursorError := cursor.All(context.TODO(), &data)

	if cursorError != nil {
		return nil, cursorError
	}

	return data, nil
}

func BulkUpdate(collection string, models []mongo.WriteModel) (*mongo.BulkWriteResult, error) {
	collectionCtx := DB.Database(Database).Collection(collection)

	return collectionCtx.BulkWrite(context.TODO(), models)
}
