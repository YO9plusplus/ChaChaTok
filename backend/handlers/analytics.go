package handlers

import (
    "tea-order/database"
    "tea-order/models"

    "github.com/gofiber/fiber/v2"
)

type MenuStat struct {
    Menu    models.Menu `json:"menu"`
    Count   int64       `json:"count"`
    Revenue float64     `json:"revenue"`
}

type AnalyticsResponse struct {
    TotalRevenue float64     `json:"total_revenue"`
    TotalOrders  int64       `json:"total_orders"`
    TopMenu      models.Menu `json:"top_menu"`
    OrdersByMenu []MenuStat  `json:"orders_by_menu"`
}

func GetAnalytics(c *fiber.Ctx) error {
    var totalOrders int64
    database.DB.Model(&models.Order{}).Count(&totalOrders)

    var totalRevenue float64
    database.DB.Model(&models.Order{}).
        Select("COALESCE(SUM(price), 0)").
        Scan(&totalRevenue)

    menus := []models.Menu{models.MenuThaiTea, models.MenuGreenTea, models.MenuRandomTea}
    ordersByMenu := make([]MenuStat, 0)

    for _, menu := range menus {
        var count int64
        var revenue float64

        database.DB.Model(&models.Order{}).
            Where("menu = ?", menu).
            Count(&count)

        database.DB.Model(&models.Order{}).
            Where("menu = ?", menu).
            Select("COALESCE(SUM(price), 0)").
            Scan(&revenue)

        ordersByMenu = append(ordersByMenu, MenuStat{
            Menu:    menu,
            Count:   count,
            Revenue: revenue,
        })
    }

    var topMenu models.Menu
    if len(ordersByMenu) > 0 {
        topMenu = ordersByMenu[0].Menu
        for _, m := range ordersByMenu[1:] {
            if m.Count > ordersByMenu[0].Count {
                topMenu = m.Menu
            }
        }
    }

    return c.JSON(AnalyticsResponse{
        TotalRevenue: totalRevenue,
        TotalOrders:  totalOrders,
        TopMenu:      topMenu,
        OrdersByMenu: ordersByMenu,
    })
}
