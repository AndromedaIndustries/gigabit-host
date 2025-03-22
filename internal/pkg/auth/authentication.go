package auth

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"sync"
	"time"
)

// JWKS represents a JSON Web Key Set as provided by authentik.
type JWKS struct {
	Keys []JSONWebKey `json:"keys"`
}

// JSONWebKey represents a single key in the JWKS.
type JSONWebKey struct {
	Alg string `json:"alg"`
	Kty string `json:"kty"`
	Use string `json:"use"`
	Kid string `json:"kid"`
	N   string `json:"n"`
	E   string `json:"e"`
}

// Authenticator holds the configuration and cached keys.
type Authenticator struct {
	JWKSURL   string
	Issuer    string
	Audience  string
	mu        sync.Mutex
	keys      map[string]interface{}
	lastFetch time.Time
}

// NewAuthenticator returns an initialized Authenticator.
func NewAuthenticator(jwksURL, issuer, audience string) *Authenticator {
	return &Authenticator{
		JWKSURL:   jwksURL,
		Issuer:    issuer,
		Audience:  audience,
		keys:      make(map[string]interface{}),
		lastFetch: time.Time{},
	}
}

// refreshKeys fetches the JWKS from authentik if the cached keys are stale.
// Here, keys are refreshed if older than one hour.
func (a *Authenticator) refreshKeys() error {
	a.mu.Lock()
	defer a.mu.Unlock()
	if time.Since(a.lastFetch) < time.Hour && len(a.keys) > 0 {
		return nil
	}
	resp, err := http.Get(a.JWKSURL)
	if err != nil {
		return err
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	var jwks JWKS
	if err := json.Unmarshal(body, &jwks); err != nil {
		return err
	}
	newKeys := make(map[string]interface{})
	for _, key := range jwks.Keys {
		pubkey, err := parseRSAPublicKey(key.N, key.E)
		if err != nil {
			return err
		}
		newKeys[key.Kid] = pubkey
	}
	a.keys = newKeys
	a.lastFetch = time.Now()
	return nil
}

// parseRSAPublicKey converts the base64url-encoded modulus and exponent to an rsa.PublicKey.
func parseRSAPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, fmt.Errorf("error decoding modulus: %v", err)
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, fmt.Errorf("error decoding exponent: %v", err)
	}
	n := new(big.Int).SetBytes(nBytes)
	e := 0
	for _, b := range eBytes {
		e = e<<8 + int(b)
	}
	return &rsa.PublicKey{N: n, E: e}, nil
}
