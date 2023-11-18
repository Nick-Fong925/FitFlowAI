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

type User struct {
	UserID   int
	Name     string
	Password string
}

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
	fmt.Printf("Connected!/n")

	// Use the cors middleware to enable CORS
	c := cors.Default()

	// Create a new HTTP handler with the cors middleware
	handler := c.Handler(http.DefaultServeMux)

	// Register the "/register" route
	http.HandleFunc("/register", registerHandler)

	/*
	users, err := getUsers()
	if err != nil {
		log.Fatal("Failed to get users: ", err)
	}

	for _, user := range users {
		fmt.Printf("UserID: %d, Username: %s\n", user.UserID, user.Name)
	}
	*/

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
		VALUES ('` + email + `', '` + password + `');
	`

	// Execute the query
	_, err := db.ExecContext(context.Background(), query, email, password)
	return err
}

func getUsers() ([]User, error) {
	// SQL statement to select only Name and Password columns
	query := `
		SELECT UserID, Name, Password FROM [User];
	`

	rows, err := db.QueryContext(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Iterate over the rows and scan the data into a User struct
	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(&user.UserID, &user.Name, &user.Password)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}
