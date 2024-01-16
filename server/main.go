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
	"fmt"
	"net/http"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type User struct {
	UserID   int    `json:"userID"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type ExerciseEntry struct {
	ExerciseID   int    `json:"exerciseID"`
	EntryID      int    `json:"entryID"`
	ExerciseName string `json:"exerciseName"`
	Sets         int    `json:"sets"`
	Reps         int    `json:"reps"`
	Weight       int    `json:"weight"`
}

type WorkoutLog struct {
	EntryID  int            `json:"entryID"`
	UserID   int            `json:"userID"`
	Date     string         `json:"date"`
	Exercises []ExerciseEntry `json:"exercises"`
}

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
	createWorkoutEntryTable(db)
	createExcerciseEntryTable(db)


	mux := http.NewServeMux()
	mux.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		registerHandler(w, r, db)
	})

	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		loginHandler(w, r, db)
	})

	mux.HandleFunc("/saveWorkoutLog", func(w http.ResponseWriter, r *http.Request) {
		saveWorkoutLogHandler(w, r, db)
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

func createWorkoutEntryTable(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS WorkoutEntry (
        EntryID SERIAL PRIMARY KEY,
        UserID INT REFERENCES "User"(UserID),
        Date DATE NOT NULL
    )`

	_, err := db.Exec(query)

	if err != nil {
		log.Fatal(err)
	}
}

func createExcerciseEntryTable(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS ExerciseEntry (
        ExerciseID SERIAL PRIMARY KEY,
        EntryID INT REFERENCES WorkoutEntry(EntryID),
        ExerciseName VARCHAR(255) NOT NULL,
        Sets INT,
        Reps INT,
        Weight INT
    )`

	_, err := db.Exec(query)

	if err != nil {
		log.Fatal(err)
	}
}

/** 
	This method handles the request to register a new User into the User table
	@var w http.ResponseWriter, r *http.Request, db *sql.DB
*/

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

/** 
	This method handles inserting the User into the User Table
	@var db *sql.DB, email, password string
*/

func insertUser(db *sql.DB, email, password string) error {
	query := `
		INSERT INTO "User" (Name, Password)
		VALUES ($1, $2)
	`

	_, err := db.ExecContext(context.Background(), query, email, password)
	return err
}

/** 
	This method handles inserting the User into the User Table
	@var w http.ResponseWriter, r *http.Request, db *sql.DB
*/

func loginHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
    // Parse the request body
    var loginData struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    _, err := loginUser(db, loginData.Email, loginData.Password)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    // Send a success response
    w.WriteHeader(http.StatusOK)
}

/** 
	This method logs the user in depending  by checking to see if user exists/matching the password
	@var email, password string
*/

func loginUser(db *sql.DB, email, password string) (*User, error) {
	// SQL statement to select user by email
	query := `
        SELECT UserID, Name, Password FROM "User"
        WHERE Name = $1;
    `

	// Execute the query
	var user User
	err := db.QueryRowContext(context.Background(), query, email).
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

func saveWorkoutLogHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var workoutLog struct {
		UserID   int `json:"userID"`
		Date     string `json:"date"`
		Exercises []struct {
			ExerciseName string `json:"exerciseName"`
			Sets         int    `json:"sets"`
			Reps         int    `json:"reps"`
			Weight       int    `json:"weight"`
		} `json:"exercises"`
	}

	// Decode the request body into the workoutLog struct
	if err := json.NewDecoder(r.Body).Decode(&workoutLog); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Save the workout log to the database
	entryID, err := saveWorkoutLog(db, workoutLog)
	if err != nil {
		http.Error(w, "Failed to save workout log", http.StatusInternalServerError)
		return
	}

	// Respond with the entryID of the saved workout log
	response := map[string]interface{}{"entryID": entryID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
func saveWorkoutLog(db *sql.DB, workoutLog WorkoutLog) (int, error) {
	// Insert the workout entry into WorkoutEntry table
	workoutEntryQuery := `
		INSERT INTO WorkoutEntry (UserID, Date)
		VALUES ($1, $2)
		RETURNING EntryID
	`
	var entryID int
	err := db.QueryRow(workoutEntryQuery, workoutLog.UserID, workoutLog.Date).Scan(&entryID)
	if err != nil {
		return 0, err
	}

	// Insert the exercises into ExerciseEntry table
	exerciseQuery := `
		INSERT INTO ExerciseEntry (EntryID, ExerciseName, Sets, Reps, Weight)
		VALUES ($1, $2, $3, $4, $5)
	`

	for _, exercise := range workoutLog.Exercises {
		_, err := db.Exec(exerciseQuery, entryID, exercise.ExerciseName, exercise.Sets, exercise.Reps, exercise.Weight)
		if err != nil {
			return 0, err
		}
	}

	return entryID, nil
}


