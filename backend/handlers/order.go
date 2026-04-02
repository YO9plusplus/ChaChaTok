package handlers

import (
	"tea-order/database" // DB to query
	"tea-order/models" //struct order and validation map
	"tea-order/ws" //use globalhub to broadcast

	"github.com/gofiber/fiber/v2"
)

//GetOrders
//GET /api/orders -> all order
//GET /api/orders?status=pending  -> filter by status

// c = (req,res) from json
func GetOrders(c *fiber.Ctx) error {
	var orders []models.Order
	query := database.DB.Order("created_at desc")

	if status := c.Query("status"); status != ""{
		if !models.ValidStatus[models.Status(status)]{
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid status filter",
			})
		}
		query = query.Where("status = ?", status)
		
	}
	
	if err := query.Find(&orders).Error; err != nil{
		return c.Status(500).JSON(fiber.Map{"error": err.Error(),})
	}
	// return c to ipad and .Json(orders) is telling fiber that it is success
	//gorm know the query output as Order type from the table name so it fill the orders we declre at the top of the function
	return c.JSON(orders)
}

type CreateOrderInput struct {
	Menu models.Menu `json:"menu"`
	Sweetness int `json:"sweetness"`
	Milk models.Milk `json:"milk"`
	IsRandom bool `json:"is_random"`
}

func CreateOrder(c *fiber.Ctx) error {
	var input CreateOrderInput 
	if err := c.BodyParser(&input); err != nil{
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	price, ok := models.MenuPrice[input.Menu]

	if !ok {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid menu",
		})
	}

	if !models.ValidSweetness[input.Sweetness] {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid sweetness",
		})
	}

	if !models.ValidMilk[input.Milk] {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid milk",
		})
	}

	order := models.Order{
		Menu: input.Menu,
		Sweetness: input.Sweetness,
		Milk: input.Milk,
		Price: price,
		Status: models.StatusPending,
		IsRandom: input.IsRandom,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	ws.GlobalHub.Broadcast("new_order", order)

	return c.Status(201).JSON(order)
}

type UpdateOrderInput struct {
	Status *models.Status `json:"status"`
	AssignedTo *string `json:"assigned_to"`
}

func UpdateOrder (c *fiber.Ctx) error {
	id := c.Params("id")

	var order models.Order // order type is Order ( have the structure of Order)

	//same as select * from order where id = id limit 1
	if err := database.DB.First(&order, id).Error; err != nil { 
		return c.Status(404).JSON(fiber.Map{
			"error": "order not found",
		})
	}

	var input UpdateOrderInput
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid body",})
    }

	if input.Status != nil {
		if !models.ValidStatus[*input.Status]{
			return c.Status(400).JSON(fiber.Map{
				"error": "invalid status",
			})
		}
		order.Status = *input.Status
	}

	if input.AssignedTo != nil {
		order.AssignedTo = *input.AssignedTo
	}

	if err := database.DB.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	ws.GlobalHub.Broadcast("order_updated", order)
	
	return c.JSON(order)
}
//what is fiber -> fiber receive the request from the clients and create fiber.ctx and sent it to header c

// var x models.Xxx → DB ไปหาใน table "xxxs" GORM intelligence

