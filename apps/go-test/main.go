package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/andromeda/gigabit-host/internal/PostgressInterface"
	"github.com/andromeda/gigabit-host/internal/types"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	logrusadapter "logur.dev/adapter/logrus"
	"logur.dev/logur"
)

type Service struct {
	ID                 string `json:"id"`
	UserID             string `json:"user_id"`
	SubscriptionActive bool   `json:"subscription_active"`
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env not loaded")
	}

	rawLog := logrus.New()
	logger := logur.LoggerToKV(logrusadapter.New(rawLog))
	postgressClient := PostgressInterface.NewPostgressInterface(logger)
	if postgressClient == nil {
		log.Fatal("Unable to connect to Postgress")
	}

	const jsonSQL = `
SELECT row_to_json(s) AS full_service
  FROM "Services" s
 WHERE subscription_active=$1
   AND id              =$2
   AND user_id         =$3;
    `

	UserId := "ac9bec3e-0f1f-457e-8993-058be55b9f78"
	ServiceId := "01JVTQFM3NH7SAA0BPGE53CF3D"

	log.Printf("Getting service UserId: %s, ServiceId: %s", UserId, ServiceId)

	dbClient := PostgressInterface.GetClient()
	if dbClient == nil {
		log.Fatal("Database client is nil")
	}

	var rawJSON []byte
	err := dbClient.QueryRow(context.Background(), jsonSQL,
		true,
		ServiceId,
		UserId,
	).Scan(&rawJSON)
	if err != nil {
		log.Fatalf("query failed: %v", err)
	}

	var svc types.Service
	if err := json.Unmarshal(rawJSON, &svc); err != nil {
		log.Fatalf("Service not found: %v", err)
	}

	// either print it raw
	fmt.Println(string(rawJSON))

}
