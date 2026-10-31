package core

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const Version = "3.0.0"
const ReleasesURL = "https://github.com/voidksa/BootEase/releases/latest"

type Action string

const (
	BIOS     Action = "bios"
	Recovery Action = "recovery"
	Explorer Action = "explorer"
	Restart  Action = "restart"
)

func (a Action) Valid() bool { return a == BIOS || a == Recovery || a == Explorer || a == Restart }
func ParseAction(args []string) Action {
	for _, arg := range args {
		s := strings.ToLower(arg)
		if !strings.HasPrefix(s, "/") && !strings.HasPrefix(s, "-") {
			continue
		}
		s = strings.TrimLeft(s, "/-")
		if s == "safe" {
			s = "recovery"
		}
		a := Action(s)
		if a.Valid() {
			return a
		}
	}
	return ""
}

// Runner is injected: tests never invoke the Windows process adapter.
type Runner interface {
	Run(context.Context, string) (string, error)
}
type Service struct{ Runner Runner }

func ActionScript(a Action) (string, error) {
	if !a.Valid() {
		return "", errors.New("unsupported action")
	}
	if a == Explorer {
		return "$ErrorActionPreference='Stop'; Get-Process -Name explorer -ErrorAction SilentlyContinue | Where-Object { $_.SessionId -eq (Get-Process -Id $PID).SessionId } | Stop-Process -Force; Start-Sleep -Milliseconds 400; Start-Process -FilePath (Join-Path $env:SystemRoot 'explorer.exe')", nil
	}
	args := "'/r','/t','0'"
	if a == BIOS {
		args = "'/r','/fw','/t','0'"
	}
	if a == Recovery {
		args = "'/r','/o','/t','0'"
	}
	return "$ErrorActionPreference='Stop'; $p=Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\\shutdown.exe') -ArgumentList @(" + args + ") -Verb RunAs -WindowStyle Hidden -Wait -PassThru; if($p.ExitCode -ne 0){throw ('shutdown failed: '+$p.ExitCode)}", nil
}
func (s Service) Perform(ctx context.Context, a Action, confirmed bool) error {
	if !confirmed {
		return errors.New("confirmation required")
	}
	script, err := ActionScript(a)
	if err != nil {
		return err
	}
	_, err = s.Runner.Run(ctx, script)
	return err
}

type Settings struct {
	AutoCheckUpdates bool   `json:"autoCheckUpdates"`
	Language         string `json:"language"`
	Theme            string `json:"theme"`
}

func NormalizeSettings(s Settings) Settings {
	if s.Language != "ar" {
		s.Language = "en"
	}
	if s.Theme != "light" && s.Theme != "dark" {
		s.Theme = "dark"
	}
	return s
}
func LoadSettings(path string, defaults Settings) Settings {
	b, err := os.ReadFile(path)
	if err != nil {
		return NormalizeSettings(defaults)
	}
	s := defaults
	if json.Unmarshal(b, &s) != nil {
		return NormalizeSettings(defaults)
	}
	return NormalizeSettings(s)
}
func SaveSettings(path string, s Settings) error {
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}
	b, err := json.Marshal(NormalizeSettings(s))
	if err != nil {
		return err
	}
	f, err := os.CreateTemp(filepath.Dir(path), "settings-*.tmp")
	if err != nil {
		return err
	}
	name := f.Name()
	defer os.Remove(name)
	if _, err = f.Write(b); err != nil {
		f.Close()
		return err
	}
	if err = f.Close(); err != nil {
		return err
	}
	return os.Rename(name, path)
}

type SystemInfo struct {
	Manufacturer            string
	Model                   string
	MotherboardManufacturer string
	MotherboardModel        string
	BiosVersion             string
	BiosMode                string
	SecureBoot              string
	OsName                  string
	OsVersion               string
	Architecture            string
}

func (s Service) Information(ctx context.Context) (SystemInfo, error) {
	var info SystemInfo
	raw, err := s.Runner.Run(ctx, SystemInfoScript)
	if err != nil {
		return info, err
	}
	err = json.Unmarshal([]byte(strings.TrimSpace(strings.TrimPrefix(raw, "\ufeff"))), &info)
	return info, err
}
func (s SystemInfo) Values() []string {
	return []string{s.Manufacturer, s.Model, s.MotherboardManufacturer, s.MotherboardModel, s.BiosVersion, s.BiosMode, s.SecureBoot, s.OsName, s.OsVersion, s.Architecture}
}

type Update struct {
	Latest    string
	Available bool
}

func CompareVersions(a, b string) int {
	parts := func(s string) []int {
		s = strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(s), "v"), "V")
		s = strings.SplitN(s, "-", 2)[0]
		s = strings.SplitN(s, "+", 2)[0]
		var out []int
		for _, p := range strings.Split(s, ".") {
			n, _ := strconv.Atoi(p)
			out = append(out, n)
		}
		return out
	}
	aa, bb := parts(a), parts(b)
	for i := 0; i < max(len(aa), len(bb)); i++ {
		x, y := 0, 0
		if i < len(aa) {
			x = aa[i]
		}
		if i < len(bb) {
			y = bb[i]
		}
		if x > y {
			return 1
		}
		if x < y {
			return -1
		}
	}
	return 0
}
func CheckUpdates(ctx context.Context, client *http.Client, endpoint string) (Update, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return Update{}, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "BootEase/"+Version)
	resp, err := client.Do(req)
	if err != nil {
		return Update{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return Update{}, fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	var release struct {
		Tag string `json:"tag_name"`
	}
	if err = json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&release); err != nil {
		return Update{}, err
	}
	if release.Tag == "" {
		return Update{}, errors.New("missing release version")
	}
	return Update{release.Tag, CompareVersions(release.Tag, Version) > 0}, nil
}

var Links = map[string]string{"repository": "https://github.com/voidksa/BootEase", "releases": ReleasesURL, "license": "https://github.com/voidksa/BootEase/blob/main/LICENSE", "loaderly": "https://loaderly.app/", "support": "https://loaderly.app/"}

// ResolveLink keeps external destinations allowlisted and locale-aware.
func ResolveLink(target, language string) (string, bool) {
	if target == "support" {
		if language == "ar" {
			return "https://loaderly.app/ar/contact/", true
		}
		return "https://loaderly.app/contact/", true
	}
	if target == "loaderly" {
		if language == "ar" {
			return "https://loaderly.app/ar", true
		}
		return "https://loaderly.app", true
	}
	if target == "donate" {
		if language == "ar" {
			return "https://creators.sa/ar/voidksa", true
		}
		return "https://creators.sa/en/voidksa", true
	}
	url, ok := Links[target]
	return url, ok
}
