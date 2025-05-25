package utilities

import (
	"strings"
	"unicode/utf8"
)

// sanitize removes or replaces any invalid-UTF8 byte sequences.
func Sanitize(s string) string {
	if utf8.ValidString(s) {
		return s
	}
	// the second argument is what to insert in place of each bad rune;
	// here we just drop them.
	return strings.ToValidUTF8(s, "")
}
