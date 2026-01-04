using System;
using System.Diagnostics;
using System.IO;
using System.Management;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Navigation;
using Microsoft.Win32;

using System.Runtime.InteropServices;
using System.Windows.Interop;

namespace BootEase
{
    public partial class MainWindow : Window
    {
        private bool _isArabic = false;
        private bool _isDarkMode = false;
        private const string CurrentVersion = "v1.1.1";
        private readonly string _configPath;

        public MainWindow()
        {
            InitializeComponent();
            VersionText.Text = CurrentVersion;

            // Setup Config Path
            string appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "BootEase");
            if (!Directory.Exists(appData)) Directory.CreateDirectory(appData);
            _configPath = Path.Combine(appData, "config.txt");

            // Auto-detect language
            var lang = System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
            _isArabic = lang == "ar";
            ApplyLocalization();

            // Setup Theme
            DetectSystemTheme();
            SystemEvents.UserPreferenceChanged += (s, e) =>
            {
                if (e.Category == UserPreferenceCategory.General)
                {
                    Dispatcher.Invoke(() =>
                    {
                        DetectSystemTheme();
                        ApplyTheme();
                    });
                }
            };

            LoadSettings();
        }

        private void DetectSystemTheme()
        {
            bool systemUsesDark = false;
            try
            {
                using (var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"))
                {
                    if (key != null)
                    {
                        var val = key.GetValue("AppsUseLightTheme");
                        if (val != null)
                        {
                            systemUsesDark = (int)val == 0;
                        }
                    }
                }
            }
            catch { }
            _isDarkMode = systemUsesDark;
        }

        private void LoadSettings()
        {
            // Load Language from config
            if (File.Exists(_configPath))
            {
                try
                {
                    string content = File.ReadAllText(_configPath);
                    if (content.Contains("Language=Ar")) _isArabic = true;
                    else if (content.Contains("Language=En")) _isArabic = false;
                }
                catch { }
            }

            ApplyTheme();
            ApplyLocalization();
        }

        private void SaveSettings()
        {
            try
            {
                string lang = _isArabic ? "Ar" : "En";
                File.WriteAllText(_configPath, $"Language={lang}");
            }
            catch { }
        }

        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);
            ApplyTheme();
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            LoadSystemInfo();
            CheckForUpdates();
        }

        private async void LoadSystemInfo()
        {
            try
            {
                await Task.Run(() =>
                {
                    string model = "Unknown";
                    string biosVer = "Unknown";
                    string biosMode = "Legacy";
                    string secureBoot = "Disabled";

                    // 1. Get Model & Manufacturer
                    try
                    {
                        using (var searcher = new ManagementObjectSearcher("SELECT Manufacturer, Model FROM Win32_ComputerSystem"))
                        {
                            foreach (ManagementObject obj in searcher.Get())
                            {
                                model = $"{obj["Manufacturer"]} {obj["Model"]}";
                            }
                        }
                    }
                    catch { }

                    // 2. Get BIOS Version
                    try
                    {
                        using (var searcher = new ManagementObjectSearcher("SELECT SMBIOSBIOSVersion FROM Win32_BIOS"))
                        {
                            foreach (ManagementObject obj in searcher.Get())
                            {
                                biosVer = obj["SMBIOSBIOSVersion"]?.ToString() ?? "Unknown";
                            }
                        }
                    }
                    catch { }

                    // 3. Get Secure Boot Status
                    try
                    {
                        using (var key = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\SecureBoot\State"))
                        {
                            if (key != null)
                            {
                                int sb = (int)(key.GetValue("UEFISecureBootEnabled") ?? 0);
                                secureBoot = sb == 1 ? "Enabled" : "Disabled";
                            }
                        }
                    }
                    catch { }

                    // 4. Check UEFI vs Legacy
                    if (secureBoot == "Enabled") biosMode = "UEFI";
                    else
                    {
                        try
                        {
                            if (Directory.Exists(Path.Combine(Environment.GetEnvironmentVariable("SystemRoot"), "Firmware")))
                                biosMode = "UEFI";
                        }
                        catch { }
                    }

                    // Update UI
                    Dispatcher.Invoke(() =>
                    {
                        ValModel.Text = model;
                        ValBiosVer.Text = biosVer;
                        ValBiosMode.Text = biosMode;
                        ValSecureBoot.Text = secureBoot;

                        if (secureBoot == "Enabled") ValSecureBoot.Foreground = Brushes.Green;
                        else ValSecureBoot.Foreground = Brushes.Red;
                    });
                });
            }
            catch
            {
                // Ignore errors
            }
        }

        private void ExecuteButton_Click(object sender, RoutedEventArgs e)
        {
            if (ActionCombo.SelectedItem is ComboBoxItem selectedItem && selectedItem.Tag != null)
            {
                string tag = selectedItem.Tag.ToString();
                string args = "";

                switch (tag)
                {
                    case "bios":
                        args = "/r /fw /t 0";
                        break;
                    case "recovery":
                        args = "/r /o /t 0";
                        break;
                    case "restart":
                        args = "/r /t 0";
                        break;
                    case "explorer":
                        RestartExplorer();
                        return;
                }

                if (!string.IsNullOrEmpty(args))
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo("shutdown", args)
                        {
                            CreateNoWindow = true,
                            UseShellExecute = true,
                            Verb = "runas"
                        });
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show(_isArabic ? $"خطأ: {ex.Message}" : $"Error: {ex.Message}", "BootEase", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private void RestartExplorer()
        {
            try
            {
                foreach (var proc in Process.GetProcessesByName("explorer"))
                {
                    proc.Kill();
                }
                Process.Start(Environment.GetEnvironmentVariable("WINDIR") + "\\explorer.exe");
            }
            catch { }
        }

        private void ActionCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ActionDesc == null) return;

            if (ActionCombo.SelectedItem is ComboBoxItem selectedItem && selectedItem.Tag != null)
            {
                string tag = selectedItem.Tag.ToString();
                if (_isArabic)
                {
                    switch (tag)
                    {
                        case "bios": ActionDesc.Text = "إعادة التشغيل والدخول مباشرة لإعدادات البيوس."; break;
                        case "recovery": ActionDesc.Text = "إعادة التشغيل إلى قائمة الاسترداد (للوضع الآمن وغيره)."; break;
                        case "restart": ActionDesc.Text = "إعادة تشغيل عادية للجهاز."; break;
                        case "explorer": ActionDesc.Text = "إعادة تشغيل واجهة سطح المكتب فقط (بدون ريستارت)."; break;
                    }
                }
                else
                {
                    switch (tag)
                    {
                        case "bios": ActionDesc.Text = "Reboots directly into BIOS/UEFI setup."; break;
                        case "recovery": ActionDesc.Text = "Reboots to Recovery Menu (Safe Mode, etc)."; break;
                        case "restart": ActionDesc.Text = "Perform a normal system restart."; break;
                        case "explorer": ActionDesc.Text = "Restarts Windows Explorer UI only."; break;
                    }
                }
            }
        }

        [System.Runtime.InteropServices.DllImport("dwmapi.dll")]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);
        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        private void ApplyTheme()
        {
            // Apply Title Bar Theme (DWM)
            try
            {
                if (PresentationSource.FromVisual(this) is HwndSource source)
                {
                    int useDarkMode = _isDarkMode ? 1 : 0;
                    DwmSetWindowAttribute(source.Handle, DWMWA_USE_IMMERSIVE_DARK_MODE, ref useDarkMode, sizeof(int));
                }
            }
            catch { }

            if (_isDarkMode)
            {
                // Dark Theme - Improved colors (less gloomy)
                Resources["WindowBackgroundBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#181818")); // Deep dark
                Resources["CardBackgroundBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#252526"));   // VS Code style
                Resources["TextPrimaryBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFF"));
                Resources["TextSecondaryBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CCCCCC"));
                Resources["BorderBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3E3E42"));
                Resources["AccentBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0078D7"));
            }
            else
            {
                // Light Theme
                Resources["WindowBackgroundBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#F3F3F3"));
                Resources["CardBackgroundBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFF"));
                Resources["TextPrimaryBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#333333"));
                Resources["TextSecondaryBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#666666"));
                Resources["BorderBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#E0E0E0"));
                Resources["AccentBrush"] = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0078D7"));
            }
        }

        private void LangButton_Click(object sender, RoutedEventArgs e)
        {
            _isArabic = !_isArabic;
            ApplyLocalization();
            SaveSettings();
        }

        private void ApplyLocalization()
        {
            if (_isArabic)
            {
                FlowDirection = FlowDirection.RightToLeft;
                LangButton.Content = "English";
                SubtitleText.Text = "أداة النظام والبيوس";
                SysInfoTitle.Text = "معلومات النظام";
                LblModel.Text = "الموديل:";
                LblBiosVer.Text = "إصدار البيوس:";
                LblBiosMode.Text = "نمط البيوس:";
                LblSecureBoot.Text = "الإقلاع الآمن:";

                ActionsTitle.Text = "خيارات الطاقة";
                LblAction.Text = "اختر إجراء:";
                ExecuteButton.Content = "تنفيذ";

                ((ComboBoxItem)ActionCombo.Items[0]).Content = "إعادة التشغيل إلى BIOS / UEFI";
                ((ComboBoxItem)ActionCombo.Items[1]).Content = "إعادة التشغيل إلى وضع الاسترداد (Safe Mode)";
                ((ComboBoxItem)ActionCombo.Items[2]).Content = "إعادة تشغيل Explorer (إصلاح الواجهة)";
                ((ComboBoxItem)ActionCombo.Items[3]).Content = "إعادة تشغيل عادية";

                UpdateRun.Text = "تحديث متوفر!";

                BtnCopyInfo.ToolTip = "نسخ معلومات النظام";
                BtnSaveInfo.ToolTip = "حفظ معلومات النظام كملف نصي";
            }
            else
            {
                FlowDirection = FlowDirection.LeftToRight;
                LangButton.Content = "عربي";
                SubtitleText.Text = "System & BIOS Utility";
                SysInfoTitle.Text = "System Information";
                LblModel.Text = "Model:";
                LblBiosVer.Text = "BIOS Version:";
                LblBiosMode.Text = "BIOS Mode:";
                LblSecureBoot.Text = "Secure Boot:";

                ActionsTitle.Text = "Power Options";
                LblAction.Text = "Select Action:";
                ExecuteButton.Content = "Execute Action";

                ((ComboBoxItem)ActionCombo.Items[0]).Content = "Restart to BIOS/UEFI";
                ((ComboBoxItem)ActionCombo.Items[1]).Content = "Restart to Recovery (Safe Mode)";
                ((ComboBoxItem)ActionCombo.Items[2]).Content = "Restart Explorer (Fix UI)";
                ((ComboBoxItem)ActionCombo.Items[3]).Content = "Normal Restart";

                UpdateRun.Text = "Update Available!";

                BtnCopyInfo.ToolTip = "Copy System Info";
                BtnSaveInfo.ToolTip = "Save System Info to Text File";
            }

            // Trigger description update
            ActionCombo_SelectionChanged(null, null);
        }

        private void CheckUpdateBtn_Click(object sender, RoutedEventArgs e)
        {
            CheckForUpdates(true);
        }

        private string GetSystemInfoString()
        {
            var sb = new System.Text.StringBuilder();
            if (_isArabic)
            {
                sb.AppendLine("--- معلومات النظام ---");
                sb.AppendLine($"الموديل: {ValModel.Text}");
                sb.AppendLine($"إصدار البيوس: {ValBiosVer.Text}");
                sb.AppendLine($"نمط البيوس: {ValBiosMode.Text}");
                sb.AppendLine($"الإقلاع الآمن: {ValSecureBoot.Text}");
                sb.AppendLine("----------------------");
                sb.AppendLine($"الإصدار: {CurrentVersion}");
            }
            else
            {
                sb.AppendLine("--- System Information ---");
                sb.AppendLine($"Model: {ValModel.Text}");
                sb.AppendLine($"BIOS Version: {ValBiosVer.Text}");
                sb.AppendLine($"BIOS Mode: {ValBiosMode.Text}");
                sb.AppendLine($"Secure Boot: {ValSecureBoot.Text}");
                sb.AppendLine("--------------------------");
                sb.AppendLine($"Version: {CurrentVersion}");
            }
            return sb.ToString();
        }

        private void BtnCopyInfo_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Clipboard.SetText(GetSystemInfoString());
                MessageBox.Show(_isArabic ? "تم نسخ المعلومات إلى الحافظة." : "System info copied to clipboard.", "BootEase", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnSaveInfo_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                SaveFileDialog saveFileDialog = new SaveFileDialog();
                saveFileDialog.Filter = "Text File (*.txt)|*.txt";
                saveFileDialog.FileName = "SystemInfo.txt";
                if (saveFileDialog.ShowDialog() == true)
                {
                    File.WriteAllText(saveFileDialog.FileName, GetSystemInfoString());
                    MessageBox.Show(_isArabic ? "تم حفظ الملف بنجاح." : "File saved successfully.", "BootEase", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void CheckForUpdates(bool manual = false)
        {
            try
            {
                if (manual) CheckUpdateBtn.IsEnabled = false;

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.UserAgent.ParseAdd("BootEase-App");
                    client.Timeout = TimeSpan.FromSeconds(5);

                    var json = await client.GetStringAsync("https://api.github.com/repos/voidksa/BootEase/releases/latest");

                    var tagKey = "\"tag_name\":";
                    var tagIndex = json.IndexOf(tagKey);
                    if (tagIndex == -1) return;

                    var startQuote = json.IndexOf("\"", tagIndex + tagKey.Length);
                    var endQuote = json.IndexOf("\"", startQuote + 1);

                    if (startQuote != -1 && endQuote != -1)
                    {
                        var latestVersion = json.Substring(startQuote + 1, endQuote - startQuote - 1);
                        if (string.Compare(latestVersion, CurrentVersion, StringComparison.OrdinalIgnoreCase) > 0)
                        {
                            UpdateText.Visibility = Visibility.Visible;
                            if (manual) MessageBox.Show(_isArabic ? "يوجد تحديث جديد!" : "New update available!", "BootEase", MessageBoxButton.OK, MessageBoxImage.Information);
                        }
                        else
                        {
                            if (manual) MessageBox.Show(_isArabic ? "أنت تستخدم أحدث إصدار." : "You are using the latest version.", "BootEase", MessageBoxButton.OK, MessageBoxImage.Information);
                        }
                    }
                }
            }
            catch
            {
                if (manual) MessageBox.Show(_isArabic ? "فشل التحقق من التحديثات." : "Failed to check for updates.", "BootEase", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                if (manual) CheckUpdateBtn.IsEnabled = true;
            }
        }

        private void Hyperlink_RequestNavigate(object sender, RequestNavigateEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo(e.Uri.AbsoluteUri) { UseShellExecute = true });
                e.Handled = true;
            }
            catch { }
        }
    }
}