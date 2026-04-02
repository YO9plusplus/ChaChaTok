//this is boardcast  manager sending the message to all other ipad
package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

//format sending to client 
type Message struct {
	Type string `json:"type"`
	Data interface{} `json:"data"`
}

// iPad 1 เปิดแอป  →  1 connection  →  clients มี 1 entry
// iPad 2 เปิดแอป  →  2 connections →  clients มี 2 entries
// iPad 3 เปิดแอป  →  3 connections →  clients มี 3 entries
type Hub struct {
	//store all connection that is current connecting each connection has diff memmory access
	clients map[*websocket.Conn]bool 
	
	//fiber run request each in goroutine
	//if 2 goroutine try to change map at the same time it will panic  -> mutex prevent this
	mu sync.RWMutex
}

//declare first before use
//owner of the map client is the data in the Globalhub
var GlobalHub = &Hub{
	clients: make(map[*websocket.Conn]bool),
}

func (h *Hub) Register(conn *websocket.Conn){
	h.mu.Lock()
	defer h.mu.Unlock() // unlock when out of finction always
	h.clients[conn] = true
	log.Printf("🔌 connected (total: %d)", len(h.clients))
}

func (h *Hub) Unregister(conn *websocket.Conn){
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, conn) //delete map,key
	log.Printf("🔌 disconnected (total: %d)", len(h.clients))
}

func (h *Hub) Broadcast(msgType string, data interface{}){
	//json.Marshal convert struct to json type 
	payload, err := json.Marshal(Message{Type: msgType, Data: data}) //:= store in local variable
	if err != nil {
		log.Println("❌ marshal error:", err)
		return 
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	for conn := range h.clients{
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil{
			conn.Close()
			delete(h.clients, conn)
		}
	}
}

//RLock = reading the data >=1 people at the time
//Loack = writing only 1 at the time 
// we use Lock beacuse we use the same map if trying to write together => panic -> deadso we make it waitng for the before to done first


