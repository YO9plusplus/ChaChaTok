package models

import "time"

type Menu string
type Milk string
type Status string

const (
	MenuThaiTea Menu = "thai_tea"
	MenuGreenTea Menu = "green_tea"
	MenuRandomTea Menu = "random_tea"
)
const (
	MilkFresh Milk = "fresh_milk"
	MilkFreeLactose Milk = "lactose_free_milk"
	MilkAlmond Milk = "almond_milk"
	MilkOat Milk = "oat_milk"
)
const (
	StatusPending Status = "pending" //waiting in queue to make
	StatusMaking Status = "making" //cooking
	StatusDone Status = "done" // cooking done
)

const (
	PriceThaiTea float64 = 39.0
	PriceGreenTea float64 = 39.0
	PriceRandomTea float64 = 39.0
)

var MenuPrice = map[Menu]float64{
	MenuThaiTea: PriceThaiTea,
	MenuGreenTea: PriceGreenTea,
	MenuRandomTea: PriceRandomTea,
}

var ValidSweetness = map[int]bool{
	0:true,
	25:true,
	50:true,
	75:true,
	100:true,
}

var ValidMilk = map[Milk]bool{
	MilkFresh:true,
	MilkFreeLactose: true,
	MilkAlmond: true,
	MilkOat: true,
}

var ValidStatus = map[Status]bool{
	StatusPending: true,
	StatusMaking: true,
	StatusDone: true,
}

type Order struct {
    ID         uint      `json:"id"          gorm:"primarykey"`
    Menu       Menu      `json:"menu"        gorm:"not null"`
    Sweetness  int       `json:"sweetness"   gorm:"not null"`
    Milk       Milk      `json:"milk"        gorm:"not null"`
    Price      float64   `json:"price"       gorm:"not null"`
    Status     Status    `json:"status"      gorm:"default:pending"`
    AssignedTo string    `json:"assigned_to"`
    IsRandom   bool      `json:"is_random"   gorm:"default:false"`
    CreatedAt  time.Time `json:"created_at"`
}




