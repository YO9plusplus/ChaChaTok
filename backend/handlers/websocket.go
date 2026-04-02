package handlers

import (
	"tea-order/ws" 
	//module name / folder name
	//we get the exportable in that folder name

	fiberws "github.com/gofiber/websocket/v2"
)

func WebSocketHandler (c *fiberws.Conn){
	ws.GlobalHub.Register(c) // open the door
	defer func() {
		ws.GlobalHub.Unregister(c)
		c.Close()
	}() // out of function we unregister 

	//waiting for connection
	for {
		//if err -> ipad disconnect
		if _,_, err := c.ReadMessage(); err != nil {
			break
		}
	}
}