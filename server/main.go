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

To view relations: \dt
To connect to database: \c FitFlowAI
*/

package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"fmt"
	"bytes"
	"io/ioutil"
	"net/http"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"strconv"
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

type WorkoutLogResponse struct {
	EntryID int `json:"entryID"`
	UserID  int `json:"userID"`
	Date    string `json:"date"`
	Entries []struct {
		Exercise string `json:"exercise"`
		Sets     int    `json:"sets"`
		Reps     int    `json:"reps"`
		Weight   int    `json:"weight"`
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

type MealLogResponse struct {
	EntryID int `json:"entryID"`
	UserID  int `json:"userID"`
	Date    string `json:"date"`
	Items   []struct {
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

	
	mux.HandleFunc("/getAllMealLogs", func(w http.ResponseWriter, r *http.Request) {
		getAllMealLogsHandler(w, r, db)
	})

	mux.HandleFunc("/getAllWorkoutLogs", func(w http.ResponseWriter, r *http.Request) {
		getAllWorkoutLogsHandler(w, r, db)
	})

	mux.HandleFunc("/deleteWorkoutEntry", func(w http.ResponseWriter, r *http.Request) {
		deleteWorkoutEntryHandler(w, r, db)
	})

	mux.HandleFunc("/deleteMealEntry", func(w http.ResponseWriter, r *http.Request) {
		deleteMealEntryHandler(w, r, db)
	})


	corsHandler := cors.New(cors.Options{
    AllowedOrigins: []string{"*"}, // Allow all origins
    AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},
    AllowedHeaders: []string{"*"},
})

log.Fatal(http.ListenAndServe(":8080", corsHandler.Handler(mux)))
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

    user, err := loginUser(db, loginData.Email, loginData.Password)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

	fmt.Printf("User %s logged in. UserID: %d\n", user.Name, user.UserID)

    // Send the UserID in the response upon successful login
    jsonResponse := map[string]interface{}{
        "status":  "success",
        "message": "Login successful",
        "userID":   user.UserID,
		"email": user.Name,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(jsonResponse)
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


func deleteWorkoutEntryHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
    // Handle CORS preflight request
    if r.Method == http.MethodOptions {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        w.WriteHeader(http.StatusOK)
        return
    }

    // Handle unsupported methods
    if r.Method != http.MethodDelete {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    // Extract entryID from the URL query parameters
    entryIDStr := r.URL.Query().Get("entryID")
    entryID, err := strconv.Atoi(entryIDStr)
    if err != nil {
        http.Error(w, "Invalid entry ID", http.StatusBadRequest)
        return
    }

    // Delete workout entry based on entry ID from the database
    err = deleteWorkoutEntry(db, entryID)
    if err != nil {
        // Handle the error and respond with an error status
        log.Println("Error deleting workout entry:", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    // Respond with success status
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.WriteHeader(http.StatusOK)
}

// Function to delete workout entry from the database
func deleteWorkoutEntry(db *sql.DB, entryID int) error {
    // Implement your logic to delete the workout entry
    // For example, you might use DELETE SQL statements

    query1 := "DELETE FROM exerciseentry WHERE EntryID = $1"
    query2 := "DELETE FROM WorkoutEntry WHERE EntryID = $1"

    _, err1 := db.Exec(query1, entryID)
    if err1 != nil {
        // Handle the error, for example log it
        log.Printf("Error deleting from exerciseentry: %v\n", err1)
        return err1
    }

    _, err2 := db.Exec(query2, entryID)
    if err2 != nil {
        // Handle the error, for example log it
        log.Printf("Error deleting from WorkoutEntry: %v\n", err2)
        return err2
    }

    // Return a single error (nil if no errors occurred)
    return nil
}


// Handler for saving eating log
func saveEatingLogHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var eatingLog EatingLog

    // Debugging output
    body, _ := ioutil.ReadAll(r.Body)
    fmt.Printf("Raw Request Body: %s\n", body)

    if err := json.NewDecoder(bytes.NewReader(body)).Decode(&eatingLog); err != nil {
        fmt.Printf("Error decoding JSON: %v\n", err)
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    fmt.Printf("Received EatingLog JSON: %+v\n", eatingLog)

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


func deleteMealEntryHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {

    if r.Method == http.MethodOptions {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        w.WriteHeader(http.StatusOK)
        return
    }

    // Handle unsupported methods
    if r.Method != http.MethodDelete {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    // Extract entryID from the URL query parameters
    entryIDStr := r.URL.Query().Get("entryID")
    entryID, err := strconv.Atoi(entryIDStr)
    if err != nil {
        http.Error(w, "Invalid entry ID", http.StatusBadRequest)
        return
    }

    // Delete workout entry based on entry ID from the database
    err = deleteMealEntry(db, entryID)
    if err != nil {
        // Handle the error and respond with an error status
        log.Println("Error deleting meal entry:", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    // Respond with success status
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.WriteHeader(http.StatusOK)
}


func  deleteMealEntry(db *sql.DB, entryID int) error {


    query1 := "DELETE FROM fooditementry WHERE EntryID = $1"
    query2 := "DELETE FROM eatingentry WHERE EntryID = $1"

    _, err1 := db.Exec(query1, entryID)
    if err1 != nil {
        // Handle the error, for example log it
        log.Printf("Error deleting from fooditementry: %v\n", err1)
        return err1
    }

    _, err2 := db.Exec(query2, entryID)
    if err2 != nil {
        // Handle the error, for example log it
        log.Printf("Error deleting from eatingentry : %v\n", err2)
        return err2
    }

    // Return a single error (nil if no errors occurred)
    return nil
}



func getAllMealLogsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userIDStr := r.URL.Query().Get("userID")

	userID, err := strconv.Atoi(userIDStr)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

	mealLogs, err := getAllMealLogs(db, userID)
	if err != nil {
		// Handle the error and respond with an error status
		log.Println("Error fetching all meal logs:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Respond with the fetched meal logs in JSON format
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mealLogs)
}

// Function to fetch all meal logs from the database
func getAllMealLogs(db *sql.DB, userID int) ([]MealLogResponse, error) {
	query := `
		SELECT e.EntryID, e.UserID, e.Date, 
			json_agg(json_build_object(
				'food', fi.Food, 
				'quantity', fi.Quantity, 
				'calories', fi.Calories
			)) as items
		FROM EatingEntry e
		LEFT JOIN FoodItemEntry fi ON e.EntryID = fi.EntryID
		WHERE e.UserID = $1
		GROUP BY e.EntryID, e.UserID, e.Date
		ORDER BY e.Date DESC
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mealLogs []MealLogResponse

	for rows.Next() {
		var mealLog MealLogResponse
		var itemsJSON string

		if err := rows.Scan(&mealLog.EntryID, &mealLog.UserID, &mealLog.Date, &itemsJSON); err != nil {
			return nil, err
		}

		if err := json.Unmarshal([]byte(itemsJSON), &mealLog.Items); err != nil {
			return nil, err
		}

		mealLogs = append(mealLogs, mealLog)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return mealLogs, nil
}

func getAllWorkoutLogsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userIDStr := r.URL.Query().Get("userID")
    userID, err := strconv.Atoi(userIDStr)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    // Fetch workout logs based on user ID from the database
    workoutLogs, err := getAllWorkoutLogs(db, userID)
    if err != nil {
        // Handle the error and respond with an error status
        log.Println("Error fetching workout logs:", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }

    // Respond with the fetched workout logs in JSON format
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(workoutLogs)
}

// Function to fetch all workout logs from the database
func getAllWorkoutLogs(db *sql.DB, userID int) ([]WorkoutLogResponse, error) {
	query := `
		SELECT e.EntryID, e.UserID, e.Date, 
			json_agg(json_build_object(
				'exercise', we.ExerciseName, 
				'sets', we.Sets, 
				'reps', we.Reps,
				'weight', we.Weight
			)) as entries
		FROM WorkoutEntry e
		LEFT JOIN ExerciseEntry we ON e.EntryID = we.EntryID
		WHERE e.UserID = $1
		GROUP BY e.EntryID, e.UserID, e.Date
		ORDER BY e.Date DESC
	`

	rows, err := db.Query(query, userID) // Pass userID as an argument
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var workoutLogs []WorkoutLogResponse

	for rows.Next() {
		var workoutLog WorkoutLogResponse
		var entriesJSON string

		if err := rows.Scan(&workoutLog.EntryID, &workoutLog.UserID, &workoutLog.Date, &entriesJSON); err != nil {
			return nil, err
		}

		if err := json.Unmarshal([]byte(entriesJSON), &workoutLog.Entries); err != nil {
			return nil, err
		}

		workoutLogs = append(workoutLogs, workoutLog)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return workoutLogs, nil
}


