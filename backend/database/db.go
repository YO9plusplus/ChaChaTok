package database

import (
	"log"
	"tea-order/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

//global variable ; this is pointer to gorm.DB 
// object still nil waiting for Connect()
//use by database.DB
var DB *gorm.DB

// Capital letter => export can call from main.go

//return 2 value 
// DB - connection obj
// err - if there is an error
func Connect() {
	var err error
	DB, err = gorm.Open(sqlite.Open("tea_orders.db"), &gorm.Config{})
	// if does not have this file -> create automatically in the sam folder running
	// = not := because := create local variable not changing global variable

	
	// stop program of error connecting
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	//autoMigrate
	// input the pointer so use &models.Order{} -> the struct in order folder 
	if err := DB.AutoMigrate(&models.Order{}); err != nil {
		log.Fatal("❌ Failed to migrate:", err)
		//gorm read struct and manage the table
		//no table => create table in sqlite if exist just update to match the struct else create new
	}
	log.Println("✅ Database connected and migrated")
}




