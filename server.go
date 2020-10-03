package main

import (
	"github.com/joho/godotenv"
	"github.com/tsuki42/reddit-clone/logging"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/tsuki42/reddit-clone/graphql/generated"
	"github.com/tsuki42/reddit-clone/graphql/resolver"
)

const defaultPort = "8080"

func init() {
	if err := godotenv.Load(); err != nil {
		logging.ERROR.Println("failed to load .env file")
	}
}

func main() {
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = defaultPort
	}

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolver.Resolver{}}))

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", srv)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
