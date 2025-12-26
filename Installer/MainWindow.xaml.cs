using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;

namespace BootEaseSetup
{
    public partial class MainWindow : Window
    {
        private bool _isUninstallMode = false;
        private string _installDir;
        private string _exePath;
        private bool _isArabic = false;

        public MainWindow()
        {
            InitializeComponent();

            // Check for Arabic language
            var lang = System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
            _isArabic = lang == "ar";

            ApplyLocalization();

            _installDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "BootEase");
            _exePath = Path.Combine(_installDir, "BootEase.exe");

            PathText.Text = _installDir;
            CheckInstallationStatus();

            // Bind checkbox only if in install mode
            AgreeCheckBox.Checked += (s, e) => UpdateActionButtonState();
            AgreeCheckBox.Unchecked += (s, e) => UpdateActionButtonState();
        }

        private void ApplyLocalization()
        {
            if (_isArabic)
            {
                // Arabic
                LangButton.Content = "English";
                TitleText.Text = "تثبيت BootEase";
                SubtitleText.Text = "تثبيت BootEase على جهاز الكمبيوتر الخاص بك";
                PathLabel.Text = "مسار التثبيت:";
                LicenseLabel.Text = "اتفاقية الترخيص:";
                AgreeCheckBox.Content = "أوافق على شروط الترخيص";
                ExitButton.Content = "خروج";
                GitHubLinkRun.Text = "مستودع GitHub";
                FlowDirection = FlowDirection.RightToLeft;
            }
            else
            {
                // English
                LangButton.Content = "عربي";
                TitleText.Text = "BootEase Setup";
                SubtitleText.Text = "Install BootEase on your computer";
                PathLabel.Text = "Installation Path:";
                LicenseLabel.Text = "License Agreement:";
                AgreeCheckBox.Content = "I agree to the license terms";
                ExitButton.Content = "Exit";
                GitHubLinkRun.Text = "GitHub Repository";
                FlowDirection = FlowDirection.LeftToRight;
            }

            CheckInstallationStatus(); // Refresh status text
        }

        private void LangButton_Click(object sender, RoutedEventArgs e)
        {
            _isArabic = !_isArabic;
            ApplyLocalization();
        }

        private void CheckInstallationStatus()
        {
            if (File.Exists(_exePath))
            {
                _isUninstallMode = true;

                // Switch UI to Uninstall Mode
                TitleText.Text = _isArabic ? "مزيل تثبيت BootEase" : "BootEase Uninstaller";
                SubtitleText.Text = _isArabic ? "إزالة BootEase من جهاز الكمبيوتر الخاص بك" : "Remove BootEase from your computer";
                ActionButton.Content = _isArabic ? "إزالة" : "Uninstall";
                ActionButton.IsEnabled = true; // No license agreement needed for uninstall

                // Hide License, Show Uninstall Message
                LicenseLabelPanel.Visibility = Visibility.Collapsed;
                LicenseScrollBorder.Visibility = Visibility.Collapsed;
                AgreeCheckBox.Visibility = Visibility.Collapsed;
                UninstallMessage.Visibility = Visibility.Visible;
                UninstallMessage.Text = _isArabic
                    ? "BootEase مثبت بالفعل. انقر فوق 'إزالة' لحذفه."
                    : "BootEase is already installed on your system. Click 'Uninstall' to remove it.";

                StatusText.Text = _isArabic ? "جاهز للإزالة" : "Ready to uninstall";
            }
            else
            {
                _isUninstallMode = false;
                ActionButton.Content = _isArabic ? "تثبيت" : "Install";
                StatusText.Text = _isArabic ? "جاهز للتثبيت" : "Ready to install";
                UpdateActionButtonState();
            }
        }

        private void UpdateActionButtonState()
        {
            if (!_isUninstallMode)
            {
                ActionButton.IsEnabled = AgreeCheckBox.IsChecked == true;
            }
        }

        private void ExitButton_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private async void ActionButton_Click(object sender, RoutedEventArgs e)
        {
            ActionButton.IsEnabled = false;
            InstallProgress.Visibility = Visibility.Visible;

            try
            {
                if (_isUninstallMode)
                {
                    StatusText.Text = _isArabic ? "جاري الإزالة..." : "Uninstalling...";
                    await Task.Run(() => PerformUninstall());
                    StatusText.Text = _isArabic ? "تمت الإزالة بنجاح!" : "Uninstallation Complete!";
                    MessageBox.Show(
                        _isArabic ? "تمت إزالة BootEase بنجاح." : "BootEase has been successfully removed.",
                        _isArabic ? "تمت الإزالة" : "Uninstalled",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    StatusText.Text = _isArabic ? "جاري التثبيت..." : "Installing...";
                    await Task.Run(() => PerformInstall());
                    StatusText.Text = _isArabic ? "تم التثبيت بنجاح!" : "Installation Complete!";
                    MessageBox.Show(
                        _isArabic ? "تم تثبيت BootEase بنجاح!" : "BootEase has been successfully installed!",
                        _isArabic ? "نجاح" : "Success",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }

                Application.Current.Shutdown();
            }
            catch (Exception ex)
            {
                StatusText.Text = _isArabic ? "فشلت العملية" : "Operation Failed";
                MessageBox.Show(
                    _isArabic ? $"خطأ: {ex.Message}" : $"Error: {ex.Message}",
                    _isArabic ? "خطأ" : "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                ActionButton.IsEnabled = true;
                InstallProgress.Visibility = Visibility.Hidden;
            }
        }

        private void PerformInstall()
        {
            // 1. Create Directory
            if (!Directory.Exists(_installDir))
            {
                Directory.CreateDirectory(_installDir);
            }

            // 2. Extract Embedded Resource
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream? stream = assembly.GetManifestResourceStream("BootEaseSetup.BootEase.exe"))
            {
                if (stream == null) throw new Exception("Embedded resource not found. Check resource name.");

                using (FileStream fileStream = new FileStream(_exePath, FileMode.Create, FileAccess.Write))
                {
                    stream.CopyTo(fileStream);
                }
            }

            // 3. Create Desktop Shortcut
            CreateShortcut(_exePath);
        }

        private void PerformUninstall()
        {
            // 1. Delete Shortcut
            string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            string shortcutPath = Path.Combine(desktopPath, "BootEase.lnk");

            if (File.Exists(shortcutPath))
            {
                File.Delete(shortcutPath);
            }

            // 2. Delete Program Files
            if (Directory.Exists(_installDir))
            {
                // Try to delete directory recursively
                try
                {
                    Directory.Delete(_installDir, true);
                }
                catch
                {
                    // Sometimes file is in use, try to delete just the exe first then dir
                    if (File.Exists(_exePath)) File.Delete(_exePath);
                    // Best effort cleanup
                }
            }
        }

        private void CreateShortcut(string targetPath)
        {
            string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            string shortcutPath = Path.Combine(desktopPath, "BootEase.lnk");

            try
            {
                Type? shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;

                dynamic? shell = Activator.CreateInstance(shellType);
                if (shell == null) return;

                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.Description = "Restart into BIOS/UEFI";
                shortcut.IconLocation = targetPath;
                shortcut.Save();
            }
            catch
            {
                // Ignore shortcut creation errors
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
