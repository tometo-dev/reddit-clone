package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"github.com/tsuki42/reddit-clone/graphql/generated"
)

func (r *queryResolver) Hello(ctx context.Context) (*string, error) {
	message := "Hello World"
	return &message, nil
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
