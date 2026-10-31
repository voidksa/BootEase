package main

import (
	"github.com/egoist/mygo"
	"github.com/egoist/mygo/ui"
)

// Sizes are logical Windows units, so native DPI scaling remains available.
func mainWindowOptions(a *application) mygo.WindowOptions {
	return mygo.WindowOptions{Title: "BootEase", TitleBarStyle: mygo.TitleBarHidden, Frameless: true, HideWindowButtons: true, Vibrancy: mygo.VibrancyAcrylic,
		Width: 960, Height: 620, DisableResize: true, DisableMaximize: true, DisableFullScreen: true, Content: ui.View(a.view)}
}
func childWindowOptions(parent *mygo.Window, title string, height int, view func(*ui.Context)) mygo.WindowOptions {
	return mygo.WindowOptions{Title: title, Parent: parent, Modal: true, Frameless: true, TitleBarStyle: mygo.TitleBarHidden, HideWindowButtons: true,
		Vibrancy: mygo.VibrancyAcrylic, Width: 460, Height: height, UseContentSize: true, DisableResize: true, DisableMinimize: true,
		DisableMaximize: true, DisableFullScreen: true, Content: ui.View(view)}
}

// Leave title/button labels unset so Windows supplies its native wording.
func systemInfoSaveOptions(parent *mygo.Window) mygo.SaveDialogOptions {
	return mygo.SaveDialogOptions{Parent: parent, DefaultPath: "BootEase-SystemInfo.txt", Filters: []mygo.FileFilter{{Name: "Text files", Extensions: []string{"txt"}}}}
}
