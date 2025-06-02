package nautobot

import "fmt"

func check(err error, message string) {
	if err != nil {
		if message != "" {
			fmt.Println(message)
		}
		panic(err)
	}
}
