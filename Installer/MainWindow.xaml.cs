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

        private const string LicenseEnglish = @"IMPORTANT: READ CAREFULLY

This software is protected under the GNU General Public License v3.0 (GPLv3) with ADDITIONAL ATTRIBUTION TERMS.

1. You are free to USE, MODIFY, and DISTRIBUTE this software.
2. You MUST NOT remove the original author's credits or the GitHub repository link.
3. You MUST NOT misrepresent modified versions as the ""Official"" version.
4. Any modifications MUST remain Open Source under GPLv3.

----------------------------------------------------------
GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Preamble

The GNU General Public License is a free, copyleft license for
software and other kinds of works.

The licenses for most software and other practical works are designed
to take away your freedom to share and change the works.  By contrast,
the GNU General Public License is intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users.";

        private const string LicenseArabic = @"هام جداً: اقرأ بعناية

هذا البرنامج محمي بموجب رخصة GNU General Public License v3.0 (GPLv3) مع شروط إضافية للحقوق.

1. لك كامل الحرية في استخدام، وتعديل، وتوزيع هذا البرنامج.
2. يمنع منعاً باتاً إزالة اسم المطور الأصلي أو رابط مستودع GitHub.
3. يمنع تقديم النسخ المعدلة على أنها ""النسخة الرسمية"".
4. أي تعديلات يجب أن تبقى مفتوحة المصدر تحت نفس رخصة GPLv3.

----------------------------------------------------------
GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

حقوق النشر (C) 2007 مؤسسة البرمجيات الحرة، Inc. <https://fsf.org/>
يسمح للجميع بنسخ وتوزيع نسخ حرفية من وثيقة الترخيص هذه، ولكن لا يسمح بتغييرها.

المقدمة

رخصة جنو العمومية هي رخصة حرة الحقوق المتروكة (Copyleft) للبرمجيات وغيرها من الأعمال.

تم تصميم تراخيص معظم البرمجيات لتسلبك حريتك في مشاركة وتغيير الأعمال. في المقابل، تهدف رخصة جنو العمومية إلى ضمان حريتك في مشاركة وتغيير جميع إصدارات البرنامج--للتأكد من أنه يظل برمجية حرة لجميع مستخدميه.";

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
                LicenseContentText.Text = LicenseArabic;
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
                LicenseContentText.Text = LicenseEnglish;
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
            ExitButton.IsEnabled = false;
            InstallProgress.Visibility = Visibility.Visible;
            InstallProgress.Value = 0;

            try
            {
                if (_isUninstallMode)
                {
                    StatusText.Text = _isArabic ? "جاري الإزالة..." : "Uninstalling...";

                    // Simulate realistic progress for uninstall
                    for (int i = 0; i <= 100; i += 5)
                    {
                        InstallProgress.Value = i;
                        await Task.Delay(30); // Quick animation
                    }

                    await Task.Run(() => PerformUninstall());

                    StatusText.Text = _isArabic ? "تمت الإزالة بنجاح!" : "Uninstallation Complete!";
                    MessageBox.Show(
                        _isArabic ? "تمت إزالة BootEase بنجاح." : "BootEase has been successfully removed.",
                        _isArabic ? "تمت الإزالة" : "Uninstalled",
                        MessageBoxButton.OK, MessageBoxImage.Information);

                    // Close immediately as requested
                    Application.Current.Shutdown();
                }
                else
                {
                    StatusText.Text = _isArabic ? "جاري التثبيت..." : "Installing...";

                    // Simulate realistic progress for install (files are small, so we fake it)
                    for (int i = 0; i <= 90; i += 2)
                    {
                        InstallProgress.Value = i;
                        await Task.Delay(20); // 1 second total approx
                    }

                    await Task.Run(() => PerformInstall());

                    InstallProgress.Value = 100;
                    await Task.Delay(200);

                    StatusText.Text = _isArabic ? "تم التثبيت بنجاح!" : "Installation Complete!";
                    MessageBox.Show(
                        _isArabic ? "تم تثبيت BootEase بنجاح!" : "BootEase has been successfully installed!",
                        _isArabic ? "نجاح" : "Success",
                        MessageBoxButton.OK, MessageBoxImage.Information);

                    Application.Current.Shutdown();
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = _isArabic ? "فشلت العملية" : "Operation Failed";
                MessageBox.Show(
                    _isArabic ? $"خطأ: {ex.Message}" : $"Error: {ex.Message}",
                    _isArabic ? "خطأ" : "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                ActionButton.IsEnabled = true;
                ExitButton.IsEnabled = true;
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

            // Determine the correct resource name
            string resourceName = "BootEaseSetup.BootEase.exe";
            if (assembly.GetManifestResourceStream(resourceName) == null)
            {
                // Fallback: Find any resource ending with BootEase.exe
                var allResources = assembly.GetManifestResourceNames();
                var foundName = Array.Find(allResources, r => r.EndsWith("BootEase.exe"));
                if (foundName != null)
                {
                    resourceName = foundName;
                }
            }

            using (Stream? stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream == null)
                {
                    throw new Exception($"Embedded resource 'BootEase.exe' not found inside installer.\nAvailable resources:\n{string.Join("\n", assembly.GetManifestResourceNames())}");
                }

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
            // 0. Kill running process if exists
            try
            {
                foreach (var proc in Process.GetProcessesByName("BootEase"))
                {
                    proc.Kill();
                    proc.WaitForExit(2000); // Wait up to 2s
                }
            }
            catch { }

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
