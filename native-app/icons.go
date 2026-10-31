package main

import (
	"embed"
	"github.com/egoist/mygo/ui"
	"time"
)

const toolbarIconSize float32 = 18
const actionIconSize float32 = 24
const navigationIconSize float32 = 18

//go:embed assets/icons/*.svg
var iconFiles embed.FS

func loadIcon(name string) *ui.SVG {
	data, err := iconFiles.ReadFile("assets/icons/" + name + ".svg")
	if err != nil {
		panic(err)
	}
	return ui.MustParseSVG(data)
}

var chipIcon = loadIcon("firmware")
var recoveryIcon = loadIcon("recovery")
var folderIcon = loadIcon("explorer")
var powerIcon = loadIcon("restart")
var arrowIcon = loadIcon("arrow-forward")
var languageIcon = loadIcon("language")
var sunIcon = loadIcon("theme-light")
var moonIcon = loadIcon("theme-dark")
var checkUpdatesIcon = loadIcon("check-updates")
var upgradeIcon = loadIcon("upgrade")
var checkIcon = loadIcon("success")
var infoIcon = loadIcon("info")
var updateIcon = loadIcon("refresh")
var websiteIcon = loadIcon("website")
var heartIcon = loadIcon("support-development")
var supportIcon = loadIcon("support")
var copyIcon = loadIcon("copy")
var saveIcon = loadIcon("export")
var closeIcon = loadIcon("close")
var minimizeIcon = loadIcon("minimize")

func toolButton(c *ui.Context, label string, icon *ui.SVG, disabled bool, rotation ...float32) bool {
	return toolButtonStyled(c, label, icon, disabled, false, rotation...)
}
func toolButtonStyled(c *ui.Context, label string, icon *ui.SVG, disabled, highlighted bool, rotation ...float32) bool {
	t := c.Theme()
	b := ui.Button(c, "").Label(label).Tooltip(label).Size(30, 30).Padding(0).Gap(0).Center().Radius(7).Border(0, t.Border).Background(ui.Transparent).Disabled(disabled)
	base := ui.Transparent
	if highlighted {
		base = t.SurfacePressed
	}
	interactiveSurface(b, t, disabled, base, highlighted)
	ink := iconInk(t)
	if highlighted {
		ink = t.Accent
	}

	if !disabled && (b.Hovered() || b.Pressed() || b.FocusVisible()) {
		ink = t.Text
		if !t.Dark {
			ink = t.Accent
		}
	}
	b.Children(func() {
		glyph := ui.Icon(c, icon).Size(toolbarIconSize, toolbarIconSize).Shrink(0).FontSize(toolbarIconSize)
		if len(rotation) > 0 {
			glyph.Rotate(rotation[0])
		}
		glyph.TextColor(glyph.AnimateColor("ink", ink, themeTransition))
	})
	return b.Clicked()
}

var interactionTransition = ui.Animation{Duration: 140 * time.Millisecond, Ease: ui.EaseOut}

func interactiveSurface(b ui.Element, t *ui.Theme, disabled bool, base ui.Color, outlined bool, primary ...bool) {
	bg, border := base, ui.Transparent
	if outlined {
		border = t.Border
	}
	pose := ui.Pose{Scale: 1}
	if disabled {
		b.Cursor(ui.CursorNotAllowed)
	} else {
		b.Cursor(ui.CursorPointer)
		if b.Hovered() {
			bg, border = t.SurfaceHover, t.Accent.Alpha(0.6)
			pose.Y = -1
		}
		if b.Pressed() {
			bg, border = t.SurfacePressed, t.Accent
			pose = ui.Pose{Scale: 0.98}
		}
		if len(primary) > 0 && primary[0] {
			bg = t.Accent
			if b.Hovered() {
				bg = t.AccentHover
			}
			if b.Pressed() {
				bg = t.AccentPressed
			}
		}
	}
	b.Background(b.AnimateColor("button-bg", bg, interactionTransition)).Border(1, b.AnimateColor("button-border", border, interactionTransition)).AnimatePose(pose, interactionTransition)
	if !disabled && b.FocusVisible() {
		b.Border(2, t.Focus)
	}
}

// Icons carry more contrast than secondary copy, especially over acrylic.
func iconInk(t *ui.Theme) ui.Color {
	if t.Dark {
		return ui.Hex("#d2d7df")
	}
	return ui.Hex("#263447")
}
