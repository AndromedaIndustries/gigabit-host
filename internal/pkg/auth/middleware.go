package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Define a custom type for context keys.
type contextKey string

// Declare a key for storing the user claims.
const userContextKey = contextKey("user")

// JWTMiddleware is a middleware that validates the JWT in the Authorization header.
func (a *Authenticator) JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Expect the token in the "Authorization" header in the format "Bearer <token>".
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}
		tokenString := parts[1]

		// Ensure the JWKS keys are refreshed.
		if err := a.refreshKeys(); err != nil {
			http.Error(w, "Error fetching JWKS: "+err.Error(), http.StatusInternalServerError)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify the token signing method is RSA.
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			// Look up the key by the "kid" header value.
			kid, ok := token.Header["kid"].(string)
			if !ok {
				return nil, errors.New("missing kid in token header")
			}
			key, exists := a.keys[kid]
			if !exists {
				return nil, errors.New("invalid kid")
			}
			return key, nil
		})
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Verify the issuer.
			if iss, ok := claims["iss"].(string); !ok || iss != a.Issuer {
				http.Error(w, "Invalid token issuer", http.StatusUnauthorized)
				return
			}
			// Verify the audience.
			if aud, ok := claims["aud"].(string); !ok || aud != a.Audience {
				http.Error(w, "Invalid token audience", http.StatusUnauthorized)
				return
			}
			// Token is valid; store claims in context using the custom key.
			ctx := context.WithValue(r.Context(), userContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		}
	})
}
