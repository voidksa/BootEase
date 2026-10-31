package main

import (
	"fmt"
	"github.com/egoist/mygo/ui"
	"github.com/voidksa/BootEase/native/internal/core"
	"strings"
	"time"
)

type application struct {
	checkingUpdate                                           bool
	updateVersion, notifiedUpdate                            string
	updateNoticePending                                      bool
	utilityFeedback                                          string
	utilityFeedbackUntil                                     time.Time
	refreshing                                               bool
	languageTransition                                       time.Time
	pendingLanguage                                          string
	settings                                                 core.Settings
	info                                                     core.SystemInfo
	loaded, busy, asking, about, updateAvailable             bool
	selected                                                 core.Action
	statusEn, statusAr, statusExtra                          string
	statusTime                                               time.Time
	onAction                                                 func(core.Action)
	onOpenConfirm, onCloseConfirm, onOpenAbout, onCloseAbout func()
	onRefresh, onUpdates                                     func()
	onCopy, onSave                                           func(string)
	onSettings                                               func(core.Settings)
	onLink                                                   func(string)
	onMinimize, onCloseMain                                  func()
}

func (a *application) tr(en, ar string) string {
	if a.settings.Language == "ar" {
		return ar
	}
	return en
}
func (a *application) actionText(id core.Action) (string, string) {
	switch id {
	case core.BIOS:
		return "BIOS / UEFI", a.tr("Open firmware settings after restarting.", "فتح إعدادات البيوس بعد إعادة التشغيل.")
	case core.Recovery:
		return a.tr("Windows Recovery", "استرداد Windows"), a.tr("Advanced startup, repair and Safe Mode.", "بدء التشغيل المتقدم والإصلاح والوضع الآمن.")
	case core.Explorer:
		return a.tr("Restart Explorer", "إعادة تشغيل Explorer"), a.tr("Refresh the desktop and taskbar.", "تحديث سطح المكتب وشريط المهام.")
	default:
		return a.tr("Restart Windows", "إعادة تشغيل Windows"), a.tr("A fresh start for your computer.", "إعادة تشغيل الجهاز بصورة عادية.")
	}
}
func (a *application) labels() []string {
	return []string{a.tr("Manufacturer", "الشركة المصنّعة"), a.tr("Device model", "موديل الجهاز"), a.tr("Board manufacturer", "مصنّع اللوحة"), a.tr("Motherboard", "اللوحة الأم"), a.tr("BIOS version", "إصدار البيوس"), a.tr("Firmware mode", "نمط البيوس"), a.tr("Secure Boot", "الإقلاع الآمن"), a.tr("Operating system", "نظام التشغيل"), a.tr("OS version", "إصدار النظام"), a.tr("Architecture", "المعمارية")}
}
func (a *application) value(s string) string {
	switch s {
	case "", "Unknown", "unknown":
		return a.tr("Unknown", "غير معروف")
	case "enabled":
		return a.tr("Enabled", "مفعّل")
	case "disabled":
		return a.tr("Disabled", "معطّل")
	case "unsupported":
		return a.tr("Not supported", "غير مدعوم")
	}
	return s
}
func (a *application) report() string {
	var b strings.Builder
	fmt.Fprintf(&b, "BootEase %s\nLoaderly | voidksa\n\n", core.Version)
	for i, v := range a.info.Values() {
		fmt.Fprintf(&b, "%s: %s\n", a.labels()[i], a.value(v))
	}
	return b.String()
}
func (a *application) savePreferences() {
	if a.onSettings != nil {
		a.onSettings(a.settings)
	}
}
func (a *application) view(c *ui.Context) {
	opacity, offset := a.languageMotion(c)
	t, background, surface := a.appearance(c)
	if a.updateNoticePending {
		a.updateNoticePending = false
		c.AddToast(ui.Toast{ID: "available-update", Title: a.tr("New version available", "يتوفر إصدار جديد"), Description: "BootEase " + a.updateVersion, Timeout: 8 * time.Second, Action: a.tr("View release", "عرض الإصدار"), OnAction: func() {
			if a.onLink != nil {
				a.onLink("releases")
			}
		}})
	}
	dir := ui.LeftToRight
	if a.settings.Language == "ar" {
		dir = ui.RightToLeft
	}
	ui.Column(c).Direction(dir).Fill().Background(background).Children(func() {
		bar := c.TitleBar()
		ui.Row(c).Direction(ui.LeftToRight).Height(48).Padding(0, bar.Right+10, 0, bar.Left+12).Gap(4).DragWindow().Children(func() {
			ui.Row(c).Height(32).Grow(1).Padding(0, 8).Gap(9).Children(func() {
				ui.Image(c, applicationIcon).Size(20, 20).Fit(ui.Contain)
				ui.Text(c, "BootEase").FontSize(13).Bold()
				ui.Text(c, a.tr("System & firmware", "النظام والبيوس")).FontSize(12).TextColor(t.TextMuted)
			})
			ui.Box(c).Width(4)
			if toolButton(c.Key("language"), a.tr("العربية", "English"), languageIcon, a.busy) {
				a.beginLanguageTransition(c)
			}

			themeIcon := moonIcon
			label := a.tr("Switch to dark theme", "التبديل للمظهر الداكن")
			if a.settings.Theme == "dark" {
				themeIcon = sunIcon
				label = a.tr("Switch to light theme", "التبديل للمظهر الفاتح")
			}
			if toolButton(c.Key("theme"), label, themeIcon, a.busy) {
				if a.settings.Theme == "dark" {
					a.settings.Theme = "light"
				} else {
					a.settings.Theme = "dark"
				}
				a.savePreferences()
			}

			updateGlyph := checkUpdatesIcon
			updateLabel := a.tr("Check for updates", "التحقق من التحديثات")
			if a.updateAvailable {
				updateGlyph = upgradeIcon
				updateLabel = a.tr("New version available", "يتوفر إصدار جديد")
			}
			if toolButtonStyled(c.Key("update"), updateLabel, updateGlyph, a.busy || a.checkingUpdate, a.updateAvailable) {
				if a.updateAvailable {
					if a.onLink != nil {
						a.onLink("releases")
					}
				} else if a.onUpdates != nil {
					a.onUpdates()
				}
			}

			if toolButton(c.Key("support"), a.tr("Support", "الدعم"), supportIcon, false) && a.onLink != nil {
				a.onLink("support")
			}
			if toolButton(c.Key("about-tool"), a.tr("About & license", "حول التطبيق والترخيص"), infoIcon, false) {
				a.showAbout()
			}
			ui.Box(c).Width(8)
			if toolButton(c.Key("minimize-window"), a.tr("Minimize window", "تصغير النافذة"), minimizeIcon, false) && a.onMinimize != nil {
				a.onMinimize()
			}
			if toolButton(c.Key("close-window"), a.tr("Close window", "إغلاق النافذة"), closeIcon, false) && a.onCloseMain != nil {
				a.onCloseMain()
			}

		})
		ui.Scroll(c).Grow(1).FillWidth().Opacity(opacity).Translate(offset, 0).Background(ui.Transparent).Children(func() {
			ui.Column(c).WidthPercent(100).MaxWidth(1080).AlignSelf(ui.Center).Padding(10, 20, 10, 20).Gap(12).Children(func() {
				ui.Row(c).Gap(12).Children(func() {
					ui.Text(c, a.tr("Boot options", "خيارات الإقلاع")).FontSize(18).Bold()
					ui.Text(c, a.tr("Windows", "Windows")).FontSize(11).Padding(3, 9).Radius(20).Background(t.Surface).TextColor(t.TextMuted)
					ui.Spacer(c)
					ui.Text(c, a.tr("Select an action to continue", "اختر إجراءً للمتابعة")).FontSize(12).TextColor(t.TextMuted)
				})
				ui.Grid(c).Columns(2).Gap(12).Children(func() {
					for _, id := range []core.Action{core.BIOS, core.Recovery} {
						title, desc := a.actionText(id)
						icon := chipIcon
						if id == core.Recovery {
							icon = recoveryIcon
						}
						blocked := id == core.BIOS && a.info.BiosMode == "Legacy"
						button := ui.Button(c.Key(string(id)), "").Label("action-"+string(id)).Disabled(a.busy || blocked).Height(98).Padding(16).Gap(14).Radius(10).Border(0, t.Border).Background(t.Surface)
						interactiveSurface(button, t, a.busy || blocked, surface, true)
						button.Children(func() {
							ink := ui.Hex("#9ebfe6")
							if id == core.Recovery {
								ink = ui.Hex("#b4c9a3")
							}
							if !t.Dark {
								ink = ui.Hex("#155bb5")
								if id == core.Recovery {
									ink = ui.Hex("#237342")
								}
							}
							glyph := ui.Icon(c, icon).FontSize(actionIconSize)
							glyph.TextColor(glyph.AnimateColor("action-ink", ink, themeTransition))
							ui.Column(c).Grow(1).Gap(6).Children(func() {
								ui.Text(c, title).Bold().FontSize(14)
								if blocked {
									desc = a.tr("Direct firmware entry requires UEFI.", "الدخول المباشر يتطلب UEFI.")
								}
								ui.Text(c, desc).FontSize(12).TextColor(t.TextMuted)
							})
							arrow := ui.Icon(c, arrowIcon).FontSize(navigationIconSize).TextColor(iconInk(t))
							if dir == ui.RightToLeft {
								arrow.Rotate(180)
							}
						})
						if button.Clicked() {
							a.requestAction(id)
						}
					}
				})
				ui.Grid(c).Columns(2).Gap(12).Children(func() {
					for _, id := range []core.Action{core.Explorer, core.Restart} {
						title, desc := a.actionText(id)
						icon := folderIcon
						if id == core.Restart {
							icon = powerIcon
						}
						b := ui.Button(c.Key(string(id)), "").Label("action-"+string(id)).Disabled(a.busy).Background(ui.Transparent).Border(1, t.Border).Padding(12, 16).Gap(12)
						interactiveSurface(b, t, a.busy, surface.Alpha(0.3), true)
						b.Children(func() {
							ui.Icon(c, icon).FontSize(actionIconSize).TextColor(iconInk(t))
							ui.Column(c).Grow(1).Gap(4).Children(func() { ui.Text(c, title).Bold(); ui.Text(c, desc).FontSize(12).TextColor(t.TextMuted) })
							arrow := ui.Icon(c, arrowIcon).FontSize(navigationIconSize).TextColor(iconInk(t))
							if dir == ui.RightToLeft {
								arrow.Rotate(180)
							}
						})
						if b.Clicked() {
							a.requestAction(id)
						}
					}
				})
				ui.Row(c).Gap(4).Padding(6, 0, 0, 0).Children(func() {
					ui.Text(c, a.tr("This device", "هذا الجهاز")).Bold().FontSize(15).Grow(1)
					for _, item := range []struct {
						en, ar   string
						disabled bool
						fn       func()
					}{{"Refresh", "تحديث", a.busy, a.onRefresh}, {"Copy", "نسخ", !a.loaded || a.busy, func() {
						if a.onCopy != nil {
							a.onCopy(a.report())
						}
					}}, {"Save as…", "حفظ باسم…", !a.loaded || a.busy, func() {
						if a.onSave != nil {
							a.onSave(a.report())
						}
					}}} {
						icon := updateIcon
						if item.en == "Copy" {
							icon = copyIcon
						}
						if item.en == "Save as…" {
							icon = saveIcon
						}
						rotation := float32(0)
						if a.utilityFeedback == item.en && c.Now().Before(a.utilityFeedbackUntil) {
							icon = checkIcon
							c.After(a.utilityFeedbackUntil.Sub(c.Now()))
						}
						if item.en == "Refresh" && a.refreshing && !c.Preferences().ReduceMotion {
							rotation = float32(c.Now().UnixMilli()%900) / 900 * 360
							c.After(16 * time.Millisecond)
						}
						if toolButton(c.Key(item.en), a.tr(item.en, item.ar), icon, item.disabled, rotation) && item.fn != nil {
							item.fn()
						}
					}
				})
				ui.Grid(c).Columns(2).GapX(24).GapY(0).Children(func() {
					for i, v := range a.info.Values() {
						ui.Row(c.Key(fmt.Sprint("info", i))).Gap(10).Padding(0, 0).Height(29).BorderWidth(0, 0, 1, 0).BorderColor(t.Border.Alpha(0.6)).Children(func() {
							ui.Text(c, a.labels()[i]).FontSize(12).TextColor(t.TextMuted).Grow(1)
							ui.Text(c, a.value(v)).FontSize(12).MaxWidth(280).SingleLine().Tooltip(a.value(v))
						})
					}
				})
				if status := a.statusText(); status != "" {
					ui.Text(c, status).FontSize(11).TextColor(t.TextMuted).Padding(2, 0).Label("Status")
				}
				if a.updateAvailable {
					b := ui.Button(c, a.tr("View release", "عرض الإصدار"))
					interactiveSurface(b, t, false, t.Surface, true)
					if b.Clicked() && a.onLink != nil {
						a.onLink("releases")
					}
				}

			})
		})

	})
	ui.ToastViewportBase(c, func(viewport ui.Element, notices []ui.Toast) {
		viewport.Padding(18).AlignItems(ui.Center).Gap(8)
		for _, notice := range notices {
			parts := ui.ToastBase(c, notice)
			dir := ui.LeftToRight
			if a.settings.Language == "ar" {
				dir = ui.RightToLeft
			}
			parts.Root.Row().Direction(dir).Gap(12).Padding(12, 14).Radius(10).Background(t.Surface).Border(1, t.Border).MaxWidth(440)
			parts.Root.Children(func() {
				ui.Icon(c, upgradeIcon).FontSize(actionIconSize).TextColor(t.Accent)
				ui.Column(c).Grow(1).Gap(4).Children(func() {
					ui.Text(c, a.tr("New version available", "يتوفر إصدار جديد")).FontSize(13).Bold().TextColor(t.Text)
					ui.Text(c, notice.Description).FontSize(12).TextColor(t.TextMuted)
				})
				action := parts.ActionButton().Label(a.tr("View release", "عرض الإصدار")).Padding(8, 10).Radius(7)
				interactiveSurface(action, t, false, t.SurfacePressed, true)
				action.Children(func() { ui.Text(c, a.tr("View release", "عرض الإصدار")).FontSize(12).TextColor(t.Text) })
				close := parts.CloseButton().Label(a.tr("Dismiss notification", "إغلاق الإشعار")).Size(28, 28).Padding(0).Gap(0).Center().Radius(7)
				interactiveSurface(close, t, false, ui.Transparent, false)
				close.Children(func() { ui.Icon(c, closeIcon).FontSize(toolbarIconSize).TextColor(t.TextMuted) })
			})
		}
	})

}

func (a *application) aboutView(c *ui.Context) {
	t, _, surface := a.appearance(c)
	if c.Shortcut(0, ui.KeyEscape) {
		a.closeAbout()
	}
	a.childFrame(c, a.tr("About BootEase", "حول BootEase"), a.closeAbout, func() {
		ui.Row(c).Gap(12).Children(func() {
			ui.Box(c).Size(44, 44).Center().Radius(11).Background(surface).Children(func() { ui.Image(c, applicationIcon).Size(32, 32).Fit(ui.Contain) })
			ui.Column(c).Gap(3).Grow(1).Children(func() {
				ui.Text(c, "BootEase").Bold().FontSize(21)
				ui.Text(c, a.tr("System & firmware utility", "أداة النظام والبيوس")).FontSize(12).TextColor(t.TextMuted)
			})
		})
		ui.Row(c).Gap(8).Children(func() {
			ui.Text(c, "v"+core.Version).FontSize(11).Padding(4, 8).Radius(5).Background(surface)
			ui.Text(c, a.tr("By Loaderly · Created by voidksa", "من Loaderly · تطوير voidksa")).FontSize(12).TextColor(t.TextMuted)
		})
		ui.Grid(c).Columns(2).Gap(10).Children(func() {
			for _, link := range []struct {
				id, en, ar, detailEn, detailAr string
				icon                           *ui.SVG
			}{
				{"loaderly", "Website", "الموقع", "loaderly.app", "loaderly.app", websiteIcon},
				{"donate", "Support development", "ادعم التطوير", "Help BootEase grow", "ساهم في تطوير BootEase", heartIcon},
			} {
				b := ui.Button(c.Key(link.id), "").Label(a.tr(link.en, link.ar)).Height(68).Padding(12).Gap(9).Radius(9)
				interactiveSurface(b, t, false, surface, true)
				b.Children(func() {
					ui.Icon(c, link.icon).FontSize(actionIconSize).TextColor(t.Accent)
					ui.Column(c).Grow(1).Gap(5).Children(func() {
						ui.Text(c, a.tr(link.en, link.ar)).FontSize(12).Bold()
						ui.Text(c, a.tr(link.detailEn, link.detailAr)).FontSize(11).TextColor(t.TextMuted)
					})
				})
				if b.Clicked() && a.onLink != nil {
					a.onLink(link.id)
				}
			}
		})
		ui.Row(c).Gap(12).Padding(10, 12).Radius(9).Background(surface).Children(func() {
			ui.Column(c).Grow(1).Gap(4).Children(func() {
				ui.Text(c, a.tr("Check for updates on startup", "التحقق من التحديثات عند التشغيل")).FontSize(12).Bold()
				ui.Text(c, a.tr("Notify me when a new version is available.", "إشعاري عند توفر إصدار جديد.")).FontSize(11).TextColor(t.TextMuted)
			})
			previous := a.settings.AutoCheckUpdates
			ui.Box(c).Direction(ui.LeftToRight).Children(func() {
				ui.Switch(c, &a.settings.AutoCheckUpdates).Label(a.tr("Automatic update checks", "التحقق التلقائي من التحديثات"))
			})
			if previous != a.settings.AutoCheckUpdates {
				a.savePreferences()
			}
		})
		ui.Row(c).Gap(8).Children(func() {
			for _, link := range []struct{ id, en, ar string }{{"repository", "Source repository", "المستودع الأصلي"}, {"license", "GPLv3 license", "ترخيص GPLv3"}} {
				b := ui.Button(c.Key(link.id), a.tr(link.en, link.ar)).FontSize(12).Padding(8, 10).Radius(7)
				interactiveSurface(b, t, false, ui.Transparent, true)
				if b.Clicked() && a.onLink != nil {
					a.onLink(link.id)
				}
			}
		})
		ui.Column(c).Gap(8).Padding(12, 0, 0, 0).BorderWidth(1, 0, 0, 0).BorderColor(t.Border).Children(func() {
			ui.Text(c, a.tr("Copyright © 2025–2026 Loaderly · GNU GPLv3", "حقوق النشر © 2025–2026 Loaderly · GNU GPLv3")).FontSize(11).TextColor(t.TextMuted)
			ui.Text(c, a.tr("Modified distributions must preserve attribution, identify changes and must not misrepresent their origin.", "يجب أن تحافظ النسخ المعدّلة على نسب العمل وتوضّح التغييرات وألا تنسب نفسها للمصدر الرسمي.")).FontSize(11).TextColor(t.TextMuted)
		})
	})
}

func (a *application) requestAction(action core.Action) {
	if a.busy || a.asking || !action.Valid() {
		return
	}
	a.selected = action
	a.asking = true
	if a.onOpenConfirm != nil {
		a.onOpenConfirm()
	}
}
func (a *application) showAbout() {
	a.about = true
	if a.onOpenAbout != nil {
		a.onOpenAbout()
	}
}
func (a *application) closeAbout() {
	a.about = false
	if a.onCloseAbout != nil {
		a.onCloseAbout()
	}
}
func (a *application) finishConfirmation(run bool) {
	if !a.asking {
		return
	}
	a.asking = false
	action := a.selected
	if a.onCloseConfirm != nil {
		a.onCloseConfirm()
	}
	if run && !a.busy && a.onAction != nil {
		a.onAction(action)
	}
}
func (a *application) confirmView(c *ui.Context) {
	t, _, _ := a.appearance(c)
	if c.Shortcut(0, ui.KeyEscape) {
		a.finishConfirmation(false)
	}
	title, _ := a.actionText(a.selected)
	message := a.tr("Your computer will restart immediately. Save your work before continuing.", "سيُعاد تشغيل الجهاز فورًا. احفظ عملك قبل المتابعة.")
	if a.selected == core.BIOS {
		message = a.tr("Your computer will restart immediately into BIOS/UEFI settings. Save your work before continuing.", "سيُعاد تشغيل الجهاز فورًا إلى إعدادات BIOS/UEFI. احفظ عملك قبل المتابعة.")
	}
	if a.selected == core.Recovery {
		message = a.tr("Your computer will restart immediately into Windows Recovery. Save your work before continuing.", "سيُعاد تشغيل الجهاز فورًا إلى استرداد Windows. احفظ عملك قبل المتابعة.")
	}
	if a.selected == core.Explorer {
		message = a.tr("The desktop and taskbar will briefly disappear while Explorer restarts.", "سيختفي سطح المكتب وشريط المهام مؤقتًا أثناء إعادة تشغيل Explorer.")
	}
	a.childFrame(c, a.tr("Confirm action", "تأكيد الإجراء"), func() { a.finishConfirmation(false) }, func() {
		ui.Text(c, title).Bold().FontSize(18)
		ui.Text(c, message).FontSize(13).TextColor(t.TextMuted)
		ui.Spacer(c)
		ui.Row(c).Gap(10).Justify(ui.End).Children(func() {
			b := ui.Button(c, a.tr("Run action", "تنفيذ الإجراء")).Disabled(a.busy).Padding(8, 14)
			interactiveSurface(b, t, a.busy, t.Surface, true)
			if b.Clicked() {
				a.finishConfirmation(true)
			}
			cancel := ui.PrimaryButton(c, a.tr("Cancel", "إلغاء")).Padding(8, 14).AutoFocus()
			interactiveSurface(cancel, t, false, t.Accent, false, true)
			if cancel.Clicked() {
				a.finishConfirmation(false)
			}
		})
	})
}

func (a *application) setStatus(en, ar string, extra ...string) {
	a.statusEn = en
	a.statusAr = ar
	a.statusExtra = strings.Join(extra, "")
	a.statusTime = time.Time{}
}
func (a *application) statusText() string {
	if !a.statusTime.IsZero() {
		stamp := a.statusTime.Format("3:04:05 PM")
		if a.settings.Language == "ar" {
			stamp = strings.ReplaceAll(strings.ReplaceAll(stamp, "AM", "ص"), "PM", "م")
		}
		return a.tr("Updated at ", "آخر تحديث في ") + stamp
	}
	return a.tr(a.statusEn, a.statusAr) + a.statusExtra
}

func (a *application) appearance(c *ui.Context) (*ui.Theme, ui.Color, ui.Color) {
	t := *c.Theme()
	if a.settings.Theme == "dark" {
		t = *ui.DarkTheme()
	}
	if a.settings.Theme == "light" {
		t = *ui.LightTheme()
	}
	if t.Dark {
		t.Background = ui.Hex("#20201f")
		t.Surface = ui.Hex("#30312f")
		t.SurfaceHover = ui.Hex("#333330")
		t.Border = ui.Hex("#3a3a37")
		t.Text = ui.Hex("#f0efec")
		t.TextMuted = ui.Hex("#bcbcb7")
		t.SurfacePressed = ui.Hex("#354457")
	} else {
		t.Background = ui.Hex("#edf1f5")
		t.Surface = ui.Hex("#ffffff")
		t.Border = ui.Hex("#cbd3dd")
		t.Text = ui.Hex("#17212e")
		t.TextMuted = ui.Hex("#4f5e70")
		t.SurfaceHover = ui.Hex("#e2e9f1")
		t.SurfacePressed = ui.Hex("#cddbea")
	}
	t.Accent = ui.Hex("#759cda")
	t.AccentHover = ui.Hex("#628bc9")
	t.AccentPressed = ui.Hex("#507ab6")
	if !t.Dark {
		t.Accent = ui.Hex("#1859ad")
		t.AccentHover = ui.Hex("#1e4f89")
		t.AccentPressed = ui.Hex("#183f70")
	}
	t.Focus = t.Accent
	t.AccentText = ui.Hex("#141a24")
	if !t.Dark {
		t.AccentText = ui.Hex("#ffffff")
	}
	t.Radius = 8
	t.Font = "Segoe UI"
	t.Spacing = 3
	t.FontSize = 13

	animate := func(key string, color ui.Color) ui.Color { return c.Root().AnimateColor(key, color, themeTransition) }
	t.Background = animate("theme-background", t.Background)
	t.Surface = animate("theme-surface", t.Surface)
	t.SurfaceHover = animate("theme-hover", t.SurfaceHover)
	t.SurfacePressed = animate("theme-pressed", t.SurfacePressed)
	t.Border = animate("theme-border", t.Border)
	t.Text = animate("theme-text", t.Text)
	t.TextMuted = animate("theme-muted", t.TextMuted)
	t.Accent = animate("theme-accent", t.Accent)
	t.AccentText = animate("theme-accent-text", t.AccentText)
	c.SetTheme(&t)
	// Native DWM material is visible only when MyGo reports backdrop support.
	background := t.Background
	surface := t.Surface
	if c.Vibrancy() && !c.Preferences().HighContrast {
		c.Root().Background(ui.Transparent)
		background = t.Background.Alpha(0.84)
		if !t.Dark {
			background = t.Background.Alpha(0.72)
		}
		surface = t.Surface.Alpha(0.76)
		if !t.Dark {
			surface = t.Surface.Alpha(0.62)
		}
	}
	return &t, background, surface
}

// A native-window content frame, not an overlay. The OS still owns the window.
func (a *application) childFrame(c *ui.Context, title string, close func(), body func()) {
	t, background, _ := a.appearance(c)
	dir := ui.LeftToRight
	if a.settings.Language == "ar" {
		dir = ui.RightToLeft
	}
	ui.Column(c).Direction(dir).Fill().Background(background).Children(func() {
		ui.Row(c).Direction(ui.LeftToRight).Height(42).Padding(0, 10, 0, 16).Gap(8).DragWindow().Children(func() {
			ui.Image(c, applicationIcon).Size(18, 18).Fit(ui.Contain)
			ui.Text(c, title).FontSize(12).TextColor(t.TextMuted).Grow(1)
			if toolButton(c.Key("child-close"), a.tr("Close", "إغلاق"), closeIcon, false) {
				close()
			}
		})
		ui.Column(c).Grow(1).FillWidth().Padding(16, 22, 22, 22).Gap(14).Children(body)
	})
}

var themeTransition = ui.Animation{Duration: 220 * time.Millisecond, Ease: ui.EaseInOut}

func (a *application) beginLanguageTransition(c *ui.Context) {
	// Ignore repeated taps until the short transition completes.
	if !a.languageTransition.IsZero() {
		return
	}
	a.pendingLanguage = "ar"
	if a.settings.Language == "ar" {
		a.pendingLanguage = "en"
	}
	a.languageTransition = c.Now()
	c.Invalidate()
}

func (a *application) languageMotion(c *ui.Context) (float32, float32) {
	if a.languageTransition.IsZero() {
		return 1, 0
	}
	elapsed := c.Now().Sub(a.languageTransition)
	if c.Preferences().ReduceMotion {
		elapsed = 260 * time.Millisecond
	}
	if elapsed >= 100*time.Millisecond && a.pendingLanguage != "" {
		a.settings.Language = a.pendingLanguage
		a.pendingLanguage = ""
		a.savePreferences()
	}
	if elapsed >= 260*time.Millisecond {
		a.languageTransition = time.Time{}
		return 1, 0
	}
	c.After(16 * time.Millisecond)
	direction := float32(1)
	if a.settings.Language == "ar" {
		direction = -1
	}
	if elapsed < 100*time.Millisecond {
		p := float32(elapsed) / float32(100*time.Millisecond)
		return 1 - p, -4 * p * direction
	}
	p := float32(elapsed-100*time.Millisecond) / float32(160*time.Millisecond)
	eased := 1 - (1-p)*(1-p)
	return eased, 4 * (1 - eased) * direction
}

func (a *application) receiveUpdate(available bool, version string) {
	a.updateAvailable = available
	a.updateVersion = version
	if available {
		if a.notifiedUpdate != version {
			a.notifiedUpdate = version
			a.updateNoticePending = true
		}
		a.setStatus("New version available: ", "يتوفر إصدار جديد: ", version)
	} else {
		a.updateNoticePending = false
		a.setStatus("No newer release is available.", "لا يتوفر إصدار أحدث.")
	}
}

// Background results are quiet unless a newer release is confirmed.
func (a *application) finishUpdateCheck(u core.Update, err error, automatic bool) {
	a.checkingUpdate = false
	if automatic && !a.settings.AutoCheckUpdates {
		return
	}
	if err != nil {
		if !automatic {
			a.setStatus("Could not check for updates. Try again later.", "تعذّر التحقق من التحديثات. حاول لاحقًا.")
		}
		return
	}
	if automatic {
		if u.Available {
			a.updateAvailable = true
			a.updateVersion = u.Latest
			if a.notifiedUpdate != u.Latest {
				a.notifiedUpdate = u.Latest
				a.updateNoticePending = true
			}
		}
		return
	}
	a.receiveUpdate(u.Available, u.Latest)
}
