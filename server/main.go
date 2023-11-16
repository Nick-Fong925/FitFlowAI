// main.go
// run command: go run main.go
// sql data base name: Nick
// pw: 19701120Nfong!
package main
import (
	_ "github.com/microsoft/go-mssqldb"
	"database/sql"
	"context"
	"log"
	"fmt"
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

	err = createUserTable()
	if err != nil {
		log.Fatal(err.Error())
	}
}

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