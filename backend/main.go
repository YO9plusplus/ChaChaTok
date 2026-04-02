package main 

import (
	"log"
    "tea-order/database"
    "tea-order/handlers"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    fiberws "github.com/gofiber/websocket/v2"
)

func main() {
	database.Connect()

	// creare web server instance 
	app := fiber.New(fiber.Config{
		AppName: "🍵 Tea Order System",
	})

	//middleware that run before every handler 
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))

	//using cors to able calling api from frontend
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		// AllowOrigins: "http://localhost:5173",
        AllowMethods: "GET,POST,PATCH,OPTIONS",
        AllowHeaders: "Content-Type,Authorization",
	}))

	app.Use("/ws", func(c *fiber.Ctx) error {
		if fiberws.IsWebSocketUpgrade(c){
			return c.Next() // send it to next hanlder
		}
		//not Websocket request senf 426 back
		return fiber.ErrUpgradeRequired
	})

	api := app.Group("/api")
    api.Get("/orders", handlers.GetOrders)
    api.Post("/orders", handlers.CreateOrder)
    api.Patch("/orders/:id", handlers.UpdateOrder)
    api.Get("/analytics", handlers.GetAnalytics)

	app.Get("/ws", fiberws.New(handlers.WebSocketHandler))
	//check if server is still running?
	app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"status": "ok"})
    })

	log.Println("🚀 Server running on http://localhost:8080")
    log.Fatal(app.Listen(":8080"))

}