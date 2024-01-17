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


type WorkoutLog struct {
	UserID    int `json:"userID"`
	Date      string `json:"date"`
	Exercises []struct {
		ExerciseName string `json:"exercise"`
		Sets         int    `json:"sets"`
		Reps         int    `json:"reps"`
		Weight       int    `json:"weight"`
	} `json:"entries"`
}

type EatingLog struct {
	UserID int `json:"userID"`
	Date   string `json:"date"`
	Items  []struct {
		Food     string `json:"food"`
		Quantity int    `json:"quantity"`
		Calories int    `json:"calories"`
	} `json:"items"`
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
	createEatingEntryTable(db)
	createFoodItemEntryTable(db)


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

	mux.HandleFunc("/saveMealLog", func(w http.ResponseWriter, r *http.Request) {
		saveEatingLogHandler(w, r, db)
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


func createEatingEntryTable(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS EatingEntry (
		EntryID SERIAL PRIMARY KEY,
		UserID INT REFERENCES "User"(UserID),
		Date DATE NOT NULL
	)`

	_, err := db.Exec(query)

	if err != nil {
		log.Fatal(err)
	}
}

func createFoodItemEntryTable(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS FoodItemEntry (
		FoodItemID SERIAL PRIMARY KEY,
		EntryID INT REFERENCES EatingEntry(EntryID),
		Food VARCHAR(255) NOT NULL,
		Quantity INT,
		Calories INT
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

	var workoutLog WorkoutLog

	// Decode the request body into the workoutLog struct
	if err := json.NewDecoder(r.Body).Decode(&workoutLog); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Save the workout log to the database
	entryID, err := saveWorkoutLog(db, workoutLog)
	if err != nil {
		// Update the error response to include error details
		http.Error(w, "Failed to save workout log: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Decoded WorkoutLog: %+v\n", workoutLog)

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

	fmt.Printf("Generated EntryID: %d\n", entryID)

	// Prepare the exercise query
	exerciseQuery := `
		INSERT INTO ExerciseEntry (EntryID, ExerciseName, Sets, Reps, Weight)
		VALUES ($1, $2, $3, $4, $5)
	`
	exerciseStmt, err := db.Prepare(exerciseQuery)
	if err != nil {
		return 0, err
	}
	defer exerciseStmt.Close()

	// Insert the exercises into ExerciseEntry table
	for _, exercise := range workoutLog.Exercises {
		_, err := exerciseStmt.Exec(entryID, exercise.ExerciseName, exercise.Sets, exercise.Reps, exercise.Weight)
		if err != nil {
			// Log the error for debugging
			fmt.Printf("Error saving exercise: %v\n", err)
			fmt.Printf("EntryID: %d, ExerciseName: %s, Sets: %d, Reps: %d, Weight: %d\n", entryID, exercise.ExerciseName, exercise.Sets, exercise.Reps, exercise.Weight)
			return 0, err
		}
	}

	return entryID, nil
}


// Handler for saving eating log
func saveEatingLogHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var eatingLog EatingLog

	// Decode the request body into the eatingLog struct
	if err := json.NewDecoder(r.Body).Decode(&eatingLog); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Save the eating log to the database
	entryID, err := saveEatingLog(db, eatingLog)
	if err != nil {
		// Update the error response to include error details
		http.Error(w, "Failed to save eating log: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Decoded EatingLog: %+v\n", eatingLog)

	// Respond with the entryID of the saved eating log
	response := map[string]interface{}{"entryID": entryID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Async function to save eating log to the database
func saveEatingLog(db *sql.DB, eatingLog EatingLog) (int, error) {
	// Insert the eating entry into EatingEntry table
	eatingEntryQuery := `
		INSERT INTO EatingEntry (UserID, Date)
		VALUES ($1, $2)
		RETURNING EntryID
	`
	var entryID int
	err := db.QueryRow(eatingEntryQuery, eatingLog.UserID, eatingLog.Date).Scan(&entryID)
	if err != nil {
		return 0, err
	}

	fmt.Printf("Generated EntryID: %d\n", entryID)

	// Prepare the food item query
	foodItemQuery := `
		INSERT INTO FoodItemEntry (EntryID, Food, Quantity, Calories)
		VALUES ($1, $2, $3, $4)
	`
	foodItemStmt, err := db.Prepare(foodItemQuery)
	if err != nil {
		return 0, err
	}
	defer foodItemStmt.Close()

	// Insert the food items into FoodItemEntry table
	for _, foodItem := range eatingLog.Items {
		_, err := foodItemStmt.Exec(entryID, foodItem.Food, foodItem.Quantity, foodItem.Calories)
		if err != nil {
			// Log the error for debugging
			fmt.Printf("Error saving food item: %v\n", err)
			fmt.Printf("EntryID: %d, Food: %s, Quantity: %d, Calories: %d\n", entryID, foodItem.Food, foodItem.Quantity, foodItem.Calories)
			return 0, err
		}
	}

	return entryID, nil
}



