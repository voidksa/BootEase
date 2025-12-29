using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Windows;
using System.Windows.Interop;
using System.Net.Http;
using System.Threading.Tasks;

namespace BootEase
{
    public partial class MainWindow : Window
    {
        private const string CurrentVersion = "v1.0.0";
        private bool _isUefi = false;
        private bool _isArabic = false;

        public MainWindow()
        {
            InitializeComponent();

            // Check for Arabic language
            var lang = System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
            _isArabic = lang == "ar";

            ApplyLocalization();

            Loaded += MainWindow_Loaded;
        }

        private void ApplyLocalization()
        {
            if (_isArabic)
            {
                // Arabic
                LangButton.Content = "English";
                AppTitleText.Text = "BootEase"; // Name stays same
                SubtitleText.Text = "أداة إعادة التشغيل إلى BIOS/UEFI البسيطة";
                RebootButton.Content = "إعادة التشغيل والدخول للبيوس";
                StatusText.Text = "جاري التحقق من حالة النظام...";
                UpdateRun.Text = "تحديث متوفر!";
                FlowDirection = FlowDirection.RightToLeft;
            }
            else
            {
                // English
                LangButton.Content = "عربي";
                AppTitleText.Text = "BootEase";
                SubtitleText.Text = "Simple BIOS/UEFI Rebooter";
                RebootButton.Content = "Restart & Enter BIOS";
                StatusText.Text = "Checking system status...";
                UpdateRun.Text = "Update Available!";
                FlowDirection = FlowDirection.LeftToRight;
            }

            // Re-check system status to update the status text in the correct language
            if (IsLoaded) CheckSystemStatus();
        }

        private void LangButton_Click(object sender, RoutedEventArgs e)
        {
            _isArabic = !_isArabic;
            ApplyLocalization();
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            if (!IsAdministrator())
            {
                RestartAsAdmin();
                return;
            }

            CheckSystemStatus();
            CheckForUpdates();
        }

        private async void CheckForUpdates()
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.UserAgent.ParseAdd("BootEase-App");
                    // Timeout after 5 seconds so we don't hang if github is slow
                    client.Timeout = TimeSpan.FromSeconds(5);

                    var json = await client.GetStringAsync("https://api.github.com/repos/voidksa/BootEase/releases/latest");

                    // Simple parsing to find tag_name
                    // JSON format: ... "tag_name": "v1.1.0", ...
                    var tagKey = "\"tag_name\":";
                    var tagIndex = json.IndexOf(tagKey);
                    if (tagIndex == -1) return;

                    var startQuote = json.IndexOf("\"", tagIndex + tagKey.Length);
                    var endQuote = json.IndexOf("\"", startQuote + 1);

                    if (startQuote != -1 && endQuote != -1)
                    {
                        var latestVersion = json.Substring(startQuote + 1, endQuote - startQuote - 1); // e.g., v1.1.0

                        // Compare versions (simple string compare works if format is consistently vX.Y.Z)
                        // If latestVersion > CurrentVersion
                        if (string.Compare(latestVersion, CurrentVersion, StringComparison.OrdinalIgnoreCase) > 0)
                        {
                            UpdateText.Visibility = Visibility.Visible;
                        }
                    }
                }
            }
            catch
            {
                // Ignore update errors (offline, api limits, etc) 
            }
        }

        private void CheckSystemStatus()
        {
            try
            {
                if (IsUefiSystem())
                {
                    _isUefi = true;
                    StatusText.Text = _isArabic
                        ? "النظام جاهز. تم اكتشاف UEFI."
                        : "System is ready. UEFI detected.";
                    RebootButton.IsEnabled = true;
                }
                else
                {
                    _isUefi = false;
                    StatusText.Text = _isArabic
                        ? "تم اكتشاف Legacy BIOS.\nلا يمكن الدخول تلقائياً للإعدادات في هذا النظام."
                        : "Legacy BIOS detected.\nWindows cannot automatically enter BIOS settings on Legacy systems.";
                    RebootButton.IsEnabled = false;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = _isArabic
                    ? $"خطأ في اكتشاف نوع النظام: {ex.Message}"
                    : $"Error detecting system type: {ex.Message}";
                RebootButton.IsEnabled = false;
            }
        }

        private void RebootButton_Click(object sender, RoutedEventArgs e)
        {
            if (!_isUefi)
            {
                MessageBox.Show(
                    _isArabic ? "هذه الميزة تتطلب نظام UEFI." : "This feature requires a UEFI system.",
                    _isArabic ? "غير مدعوم" : "Not Supported",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var msg = _isArabic
                ? "سيتم إعادة تشغيل جهازك فوراً والدخول إلى إعدادات BIOS/UEFI.\n\nاحفظ جميع أعمالك قبل المتابعة.\n\nهل أنت متأكد؟"
                : "Your computer will restart immediately and enter the BIOS/UEFI settings.\n\nSave all your work before proceeding.\n\nAre you sure?";

            var title = _isArabic ? "تأكيد إعادة التشغيل" : "Confirm Restart";

            var result = MessageBox.Show(msg, title, MessageBoxButton.YesNo, MessageBoxImage.Question,
                _isArabic ? MessageBoxResult.No : MessageBoxResult.No,
                _isArabic ? MessageBoxOptions.RtlReading | MessageBoxOptions.RightAlign : MessageBoxOptions.None);

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "shutdown",
                        Arguments = "/r /fw /t 0",
                        UseShellExecute = false,
                        CreateNoWindow = true
                    });
                }
                catch (Exception ex)
                {
                    var errMsg = _isArabic
                        ? $"فشل تنفيذ أمر إعادة التشغيل:\n{ex.Message}"
                        : $"Failed to execute restart command:\n{ex.Message}";
                    var errTitle = _isArabic ? "خطأ" : "Error";
                    MessageBox.Show(errMsg, errTitle, MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private bool IsAdministrator()
        {
            var identity = WindowsIdentity.GetCurrent();
            var principal = new WindowsPrincipal(identity);
            return principal.IsInRole(WindowsBuiltInRole.Administrator);
        }

        private void RestartAsAdmin()
        {
            var fileName = Process.GetCurrentProcess().MainModule?.FileName;
            if (string.IsNullOrEmpty(fileName))
            {
                MessageBox.Show(
                    _isArabic ? "تعذر تحديد مسار التطبيق لإعادة التشغيل كمسؤول." : "Could not determine application path to restart as admin.",
                    _isArabic ? "خطأ" : "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            var startInfo = new ProcessStartInfo(fileName)
            {
                UseShellExecute = true,
                Verb = "runas"
            };

            try
            {
                Process.Start(startInfo);
                Application.Current.Shutdown();
            }
            catch (Exception)
            {
                MessageBox.Show(
                    _isArabic ? "تتطلب هذه العملية صلاحيات المسؤول." : "Administrator privileges are required to run this application.",
                    _isArabic ? "تم رفض الوصول" : "Access Denied",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                Application.Current.Shutdown();
            }
        }

        private void Hyperlink_RequestNavigate(object sender, System.Windows.Navigation.RequestNavigateEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo(e.Uri.AbsoluteUri) { UseShellExecute = true });
                e.Handled = true;
            }
            catch { }
        }

        // P/Invoke for GetFirmwareType
        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool GetFirmwareType(out FirmwareType firmwareType);

        private enum FirmwareType
        {
            Unknown = 0,
            Bios = 1,
            Uefi = 2,
            Max = 3
        }

        private bool IsUefiSystem()
        {
            // First try GetFirmwareType API
            try
            {
                if (GetFirmwareType(out FirmwareType type))
                {
                    return type == FirmwareType.Uefi;
                }
            }
            catch
            {
                // Fallback or ignore
            }

            // Fallback: Check environment variable that only exists on UEFI
            // However, GetFirmwareType is reliable on Win8+ (which covers Win10/11)
            return false;
        }
    }
}
