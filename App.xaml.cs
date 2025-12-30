using System.Diagnostics;
using System.Windows;

namespace BootEase
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            if (e.Args.Length > 0)
            {
                bool handled = false;
                foreach (var arg in e.Args)
                {
                    switch (arg.ToLower())
                    {
                        case "/bios":
                        case "-bios":
                        case "--bios":
                            // Restart to Firmware (BIOS)
                            try
                            {
                                Process.Start(new ProcessStartInfo("shutdown", "/r /fw /t 0") { CreateNoWindow = true, UseShellExecute = true });
                                handled = true;
                            }
                            catch { /* Ignore permission errors */ }
                            break;

                        case "/recovery":
                        case "-recovery":
                            // Restart to Recovery Environment (Blue Screen Menu)
                            try
                            {
                                Process.Start(new ProcessStartInfo("shutdown", "/r /o /t 0") { CreateNoWindow = true, UseShellExecute = true });
                                handled = true;
                            }
                            catch { }
                            break;

                        case "/safe":
                        case "-safe":
                            // Safe mode usually requires bcdedit, but /o is safer as it prompts user. 
                            // Direct Safe Mode command: bcdedit /set {current} safeboot minimal
                            // We will use the Recovery Menu for safety as requested by "Advanced Boot Options" best practice for tools
                            try
                            {
                                Process.Start(new ProcessStartInfo("shutdown", "/r /o /t 0") { CreateNoWindow = true, UseShellExecute = true });
                                handled = true;
                            }
                            catch { }
                            break;
                    }
                }

                if (handled)
                {
                    Shutdown();
                    return;
                }
            }

            base.OnStartup(e);
        }
    }
}