package main

import (
	_ "embed"
	"github.com/egoist/mygo/ui"
)

//go:embed resources/icon.png
var applicationIconPNG []byte

var applicationIcon = func() *ui.Bitmap {
	bitmap, err := ui.DecodeBitmap(applicationIconPNG)
	if err != nil {
		panic("BootEase icon could not be decoded: " + err.Error())
	}
	return bitmap
}()
