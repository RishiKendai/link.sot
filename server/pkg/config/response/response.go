package response

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// 200 with data
func SendJSON(c *gin.Context, data any) {
	c.JSON(http.StatusOK, bson.M{
		"status": "success",
		"data":   data,
	})
}

// 200 with message
func SendStatusMessage(c *gin.Context, message string) {
	c.JSON(http.StatusOK, bson.M{
		"status":  "success",
		"message": message,
	})
}

// 201 with message
func SendCreated(c *gin.Context, message string) {
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": message,
	})
}

// 202 with message
func SendAccepted(context *gin.Context, message string) {
	context.JSON(http.StatusAccepted, gin.H{
		"status":  "success",
		"message": message,
	})
}

// ServeHTML renders an HTML template with the given status code, template name, and data.
func ServeHTML(c *gin.Context, status int, name string, obj interface{}) {
	c.HTML(status, name, obj)
}

// ServeHTMLFile serves an HTML file from the static directory with the given status code.
func ServeHTMLFile(c *gin.Context, filename string, status int) {
	fullPath := filepath.Join("templates", filename)
	file, err := os.Open(fullPath)
	if err != nil {
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}
	defer file.Close()

	c.DataFromReader(status, -1, "text/html; charset=utf-8", file, nil)

}

/* ---------------- Error Functions ---------------- */

// 400 with error, message and abort
func SendBadRequestError(context *gin.Context, message string) {
	context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
		"status": "error",
		"error":  message,
	})
}

// 401 with error and abort
func SendUnAuthorizedError(c *gin.Context, message string) {
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
		"status": "error",
		"error":  message,
	})
}

// 403 with error
func SendForbiddenError(c *gin.Context, message string) {
	c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
		"status": "error",
		"error":  message,
	})
}

// 404 with message
func SendNotFoundError(c *gin.Context, message string) {
	c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
		"status": "error",
		"error":  message,
	})
}

// 500 with error
func SendServerError(c *gin.Context, err error) {
	c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
		"status": "error",
		"error":  err.Error(),
	})

	log.Printf("ErrorPath: %s Error:: %s", c.HandlerName(), err.Error())
}

/* ---------------- Common Functions ---------------- */

// status code
func SendStatus(c *gin.Context, code int) {
	c.AbortWithStatus(code)
}

// status code with error
func SendStatusWithError(c *gin.Context, code int, err error) {
	c.AbortWithError(code, err)
}
