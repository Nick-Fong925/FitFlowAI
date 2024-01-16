// main.go
// run command: go run main.go
// sql data base name: Nick
// pw: 19701120Nfong!

//docker run --name FitFlow -e POSTGRES_PASSWORD=19701120 -p 5432:5432 -d postgres

/*
Commands to know:

To start new docker: docker run --name FitFlow -e POSTGRES_PASSWORD=19701120 -p 5432:5432 -d postgres
To see which containers are running: docker ps

To intialize: 
docker exec -ti FitFlow createdb -U postgres FitFlowAI
String to access docker command line: docker exec -ti FitFlow psql -U postgres

To view relaqtions: \dt
To connect to database: \c FitFlowAI
*/

package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

func main() {
	connStr := "postgres://postgres:19701120@localhost:5432/FitFlowAI?sslmode=disable"
	db, err := sql.Open("postgres", connStr)

	if err != nil {
		log.Fatal(err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	createUserTable(db)
	changeTable(db)

	mux := http.NewServeMux()
	mux.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		registerHandler(w, r, db)
	})

	handler := cors.Default().Handler(mux)

	log.Fatal(http.ListenAndServe(":8080", handler))
}

/** 

	This method creates the User Table in the Postgres SQL sever
	@var db *sql.DB


*/

func createUserTable(db *sql.DB) {
	query := `
    CREATE TABLE IF NOT EXISTS "User" (
        UserID SERIAL PRIMARY KEY,
        Name VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL
    )`

	_, err := db.Exec(query)

	if err != nil {
		log.Fatal(err)
	}
}


func registerHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var registrationData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&registrationData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := insertUser(db, registrationData.Email, registrationData.Password)
	if err != nil {
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func insertUser(db *sql.DB, email, password string) error {
	query := `
		INSERT INTO "User" (Name, Password)
		VALUES ($1, $2)
	`

	_, err := db.ExecContext(context.Background(), query, email, password)
	return err
}

/*

type User struct {
	UserID   int
	Name     string
	Password string
}

type WorkoutLog struct {
	UserID  int       `json:"userID"`
	Date    string    `json:"date"`
	Entries []Entry   `json:"entries"`
}


type Entry struct {
	Exercise string `json:"exercise"`
	Sets     int    `json:"sets"`
	Reps     int    `json:"reps"`
	Weight   int    `json:"weight"`
}


func main() {

	connString := getConnectionString()
	var err error

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
	err = createWorkoutLogsTable()
	if err != nil {
		fmt.Println("Error creating WorkoutLogs table:", err)
		return
	}

	err = createWorkoutEntriesTable()
	if err != nil {
		fmt.Println("Error creating WorkoutEntries table:", err)
		return
	}


	c := cors.Default()
	handler := c.Handler(http.DefaultServeMux)

	// Register the "/register" route
	http.HandleFunc("/register", registerHandler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/saveWorkoutLog", saveWorkoutLogHandler)


	log.Fatal(http.ListenAndServe(":8080", handler))
}

func getConnectionString() string {
	return fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d;database=%s;",
		server, user, password, port, database)
}

//REGISTER HANDLER
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


 //INSERT USER FUNCTION
func insertUser(email, password string) error {
	// SQL statement to insert user into the User table
	query := `
		INSERT INTO "User" (Name, Password)
		VALUES ('` + email + `', '` + password + `');
	`

	// Execute the query
	_, err := db.ExecContext(context.Background(), query)
	return err
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
    // Parse the request body
    var loginData struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    _, err := loginUser(loginData.Email, loginData.Password)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    // Send a success response
    w.WriteHeader(http.StatusOK)
}

func loginUser(email, password string) (*User, error) {
    // SQL statement to select user by email
    query := `
        SELECT UserID, Name, Password FROM [User]
        WHERE Name = @name;
    `

    // Execute the query
    var user User
    err := db.QueryRowContext(context.Background(), query, sql.Named("name", email)).
        Scan(&user.UserID, &user.Name, &user.Password)

    if err == sql.ErrNoRows {
        return nil, fmt.Errorf("User does not exist. Please register.")
    } else if err != nil {
        return nil, err
    }

 
    if user.Password != password {
        return nil, fmt.Errorf("Invalid password")
    }

    return &user, nil
}

func getUsers() ([]User, error) {
	query := `
		SELECT UserID, Name, Password FROM [User];
	`

	rows, err := db.QueryContext(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

func insertWorkoutLog(log WorkoutLog) error {
	// Begin a transaction
	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()


	result, err := tx.ExecContext(context.Background(), fmt.Sprintf(`
	INSERT INTO WorkoutLogs (UserID, Date)
	VALUES (%d, '%s')
	`, log.UserID, log.Date))
	if err != nil {
	
		return err
	}



	logID, err := result.LastInsertId()
	if err != nil {
		return err
	}
	for _, entry := range log.Entries {
		_, err := tx.ExecContext(context.Background(), fmt.Sprintf(`
			INSERT INTO WorkoutEntries (LogID, Exercise, Sets, Reps, Weight)
			VALUES (%d, '%s', %d, %d, %d)
		`, logID, entry.Exercise, entry.Sets, entry.Reps, entry.Weight))
		if err != nil {
			return err
		}
	}


	if err := tx.Commit(); err != nil {
		fmt.Println("Error committing transaction:", err)
		return err
	}

	fmt.Println("Workout log inserted successfully!")
	return nil
}


func saveWorkoutLogHandler(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}


	fmt.Println("Received workout log request body:", string(body))


	bodyReader := bytes.NewReader(body)

	var workoutLog WorkoutLog
	if err := json.NewDecoder(bodyReader).Decode(&workoutLog); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}


	if err := insertWorkoutLog(workoutLog); err != nil {
		http.Error(w, "Error inserting workout log into the database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

*/