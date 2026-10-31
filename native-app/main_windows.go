package main

import (
	"context"
	"github.com/egoist/mygo"
	"github.com/egoist/mygo/transfer"
	"github.com/voidksa/BootEase/native/internal/core"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	mygo.App.SetName("BootEase")
	mygo.App.SetLanguages("en", "ar")
	// Native dialogs follow Windows; app content uses its own saved locale.
	mygo.App.SetLocale("")
	if !mygo.App.RequestSingleInstanceLock() {
		return
	}
	var window *mygo.Window
	var app *application
	mygo.App.OnSecondInstance(func(args []string, _ string) {
		if window != nil {
			window.Restore()
			window.Focus()
			if action := core.ParseAction(args); action != "" {
				window.Update(func() {
					if !app.busy {
						app.requestAction(action)
					}
				})
			}
		}
	})
	mygo.App.WhenReady(func() {
		config, _ := os.UserConfigDir()
		settingsPath := filepath.Join(config, "bootease", "settings.json")
		language := "en"
		if strings.HasPrefix(mygo.App.Locale(), "ar") {
			language = "ar"
		}
		app = &application{settings: core.LoadSettings(settingsPath, core.Settings{Language: language, Theme: "dark"})}
		service := core.Service{Runner: windowsRunner{}}
		mygo.Theme.SetSource(mygo.ThemeSource(app.settings.Theme))
		window = mygo.NewWindow(mainWindowOptions(app))
		app.onMinimize = window.Minimize
		app.onCloseMain = window.Close
		var confirmWindow, aboutWindow *mygo.Window
		app.onOpenConfirm = func() {
			if confirmWindow != nil {
				confirmWindow.Focus()
				return
			}
			title, _ := app.actionText(app.selected)
			confirmWindow = mygo.NewWindow(childWindowOptions(window, title, 240, app.confirmView))
			confirmWindow.OnClosed(func() { confirmWindow = nil; app.asking = false; window.Invalidate() })
		}
		app.onCloseConfirm = func() {
			if confirmWindow != nil {
				confirmWindow.Close()
			}
		}
		app.onOpenAbout = func() {
			if aboutWindow != nil {
				aboutWindow.Focus()
				return
			}
			aboutWindow = mygo.NewWindow(childWindowOptions(window, app.tr("About BootEase", "حول BootEase"), 480, app.aboutView))
			aboutWindow.OnClosed(func() { aboutWindow = nil; app.about = false; window.Invalidate() })
		}
		app.onCloseAbout = func() {
			if aboutWindow != nil {
				aboutWindow.Close()
			}
		}
		// All OS work is behind adapters and callbacks; view tests inject only fakes.
		start := func(work func(context.Context) func()) {
			if app.busy {
				return
			}
			app.busy = true
			app.setStatus("Working…", "جارٍ التنفيذ…")
			go func() {
				ctx, cancel := context.WithTimeout(context.Background(), 40*time.Second)
				defer cancel()
				done := work(ctx)
				window.Update(func() { app.busy = false; done() })
			}()
		}
		app.onSettings = func(s core.Settings) {
			if err := core.SaveSettings(settingsPath, s); err != nil {
				app.setStatus("Could not save preferences.", "تعذّر حفظ التفضيلات.")
			}
			mygo.Theme.SetSource(mygo.ThemeSource(s.Theme))
			window.Invalidate()
		}
		app.onRefresh = func() {
			if app.busy {
				return
			}
			app.refreshing = true
			start(func(ctx context.Context) func() {
				info, err := service.Information(ctx)
				return func() {
					app.refreshing = false
					if err != nil {
						app.setStatus("Could not read system information.", "تعذّرت قراءة معلومات النظام.")
						return
					}
					app.info = info
					app.loaded = true
					app.statusTime = time.Now()
					app.utilityFeedback = "Refresh"
					app.utilityFeedbackUntil = time.Now().Add(1600 * time.Millisecond)
				}
			})
		}
		app.onAction = func(action core.Action) {
			start(func(ctx context.Context) func() {
				err := service.Perform(ctx, action, true)
				return func() {
					if err != nil {
						msg := strings.ToLower(err.Error())
						if strings.Contains(msg, "cancel") || strings.Contains(msg, "1223") {
							app.setStatus("Permission request cancelled. No action completed.", "أُلغي طلب الصلاحية. لم يكتمل الإجراء.")
						} else {
							app.setStatus("Windows could not complete the action.", "تعذّر على Windows إكمال الإجراء.")
						}
						return
					}
					app.setStatus("The command completed successfully.", "اكتمل الأمر بنجاح.")
				}
			})
		}
		checkUpdates := func(automatic bool) {
			if app.checkingUpdate {
				return
			}
			app.checkingUpdate = true
			window.Invalidate()
			go func() {
				ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
				defer cancel()
				u, err := core.CheckUpdates(ctx, &http.Client{Timeout: 15 * time.Second}, "https://api.github.com/repos/voidksa/BootEase/releases/latest")
				window.Update(func() { app.finishUpdateCheck(u, err, automatic) })
			}()
		}
		app.onUpdates = func() { checkUpdates(false) }

		app.onCopy = func(text string) {
			if err := mygo.Clipboard.Write(transfer.TextData(text)); err != nil {
				app.setStatus("Could not copy information.", "تعذّر نسخ المعلومات.")
			} else {
				app.utilityFeedback = "Copy"
				app.utilityFeedbackUntil = time.Now().Add(1600 * time.Millisecond)
				app.setStatus("System information copied.", "نُسخت معلومات النظام.")
			}
		}
		app.onSave = func(text string) {
			start(func(ctx context.Context) func() {
				path, err := mygo.Dialog.Save(systemInfoSaveOptions(window))
				if err == nil && path != "" {
					err = os.WriteFile(path, []byte(text), 0600)
				}
				return func() {
					if err != nil {
						app.setStatus("Could not save the file.", "تعذّر حفظ الملف.")
					} else if path == "" {
						app.setStatus("Save cancelled.", "أُلغي الحفظ.")
					} else {
						app.utilityFeedback = "Save as…"
						app.utilityFeedbackUntil = time.Now().Add(1600 * time.Millisecond)
						app.setStatus("Information saved.", "حُفظت المعلومات.")
					}
				}
			})
		}
		app.onLink = func(target string) {
			if url, ok := core.ResolveLink(target, app.settings.Language); ok {
				if err := mygo.Shell.OpenExternal(url); err != nil {
					app.setStatus("Could not open the link.", "تعذّر فتح الرابط.")
				}
			}
		}
		if action := core.ParseAction(os.Args[1:]); action != "" {
			app.requestAction(action)
		} else {
			app.onRefresh()
			if app.settings.AutoCheckUpdates {
				checkUpdates(true)
			}
		}
	})
	if err := mygo.App.Run(); err != nil {
		log.Fatal(err)
	}
}
