// main.go
// run command: go run main.go
// sql data base name: Nick
// pw: 19701120Nfong!

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/rs/cors"
	"context"
)

var db *sql.DB
var server = "fitflow.database.windows.net"
var port = 1433
var user = "Nick"
var password = "19701120Nfong!"
var database = "FitFlowAI User"

func main() {
	// Build connection string
	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d;database=%s;",
		server, user, password, port, database)
	var err error
	// Create connection pool
	db, err = sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("Error creating connection pool: ", err.Error())
	}
	ctx := context.Background()
	err = db.PingContext(ctx)
	if err != nil {
		log.Fatal(err.Error())
	}
	fmt.Printf("Connected!")

	/*
	err = createUserTable()
	if err != nil {
		log.Fatal(err.Error())
	}
	*/

	// Use the cors middleware to enable CORS
	c := cors.Default()

	// Create a new HTTP handler with the cors middleware
	handler := c.Handler(http.DefaultServeMux)

	// Register the "/register" route
	http.HandleFunc("/register", registerHandler)

	// Start the HTTP server
	log.Fatal(http.ListenAndServe(":8080", handler))
}

/*
func createUserTable() error {
	// SQL statement to create User table
	query := `
		CREATE TABLE [User] (
			UserID INT PRIMARY KEY IDENTITY(1,1),
			Name NVARCHAR(255),
			Password NVARCHAR(255)
		);
	`

	// Execute the query
	_, err := db.ExecContext(context.Background(), query)
	if err != nil {
		return err
	}

	fmt.Println("User table created successfully!")
	return nil
}
*/

func registerHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the request body
	var registrationData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&registrationData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Insert the user data into the database
	err := insertUser(registrationData.Email, registrationData.Password)
	if err != nil {
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.WriteHeader(http.StatusOK)
}

func insertUser(email, password string) error {
	// SQL statement to insert user into the User table
	query := `
		INSERT INTO [User] (Name, Password)
		VALUES ($1, $2);
	`

	// Execute the query
	_, err := db.ExecContext(context.Background(), query, email, password)
	return err
}

