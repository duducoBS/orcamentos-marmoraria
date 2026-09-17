using System.Diagnostics;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace OrcamentosWindows;

public partial class Form1 : Form
{
    private WebView2 _webView = null!;

    public Form1()
    {
        InitializeComponent();
        SetupWindow();
        InitializeWebView();
    }

    private void SetupWindow()
    {
        Text = "Orçamentos - Edu Mármores & Granitos";
        Width = 1360;
        Height = 880;
        MinimumSize = new Size(900, 600);
        StartPosition = FormStartPosition.CenterScreen;

        var icoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appicon.ico");
        if (File.Exists(icoPath))
        {
            try { Icon = new Icon(icoPath); } catch { }
        }
    }

    private async void InitializeWebView()
    {
        _webView = new WebView2
        {
            Dock = DockStyle.Fill
        };
        Controls.Add(_webView);

        try
        {
            // Salva dados locais e cache em %LOCALAPPDATA%\EduMarmoraria\Orcamentos\WebView2Data
            var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            var userDataFolder = Path.Combine(localAppData, "EduMarmoraria", "Orcamentos", "WebView2Data");
            Directory.CreateDirectory(userDataFolder);

            var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            await _webView.EnsureCoreWebView2Async(env);

            var wwwPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "www");
            if (!Directory.Exists(wwwPath))
            {
                wwwPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", ".."));
            }

            _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "app.local",
                wwwPath,
                CoreWebView2HostResourceAccessKind.Allow
            );

            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;

            _webView.CoreWebView2.NewWindowRequested += (s, e) =>
            {
                // Abre links externos (ex: WhatsApp) no navegador padrão do Windows
                if (!string.IsNullOrEmpty(e.Uri) && !e.Uri.Contains("app.local"))
                {
                    e.Handled = true;
                    try
                    {
                        Process.Start(new ProcessStartInfo(e.Uri) { UseShellExecute = true });
                    }
                    catch { }
                }
            };

            _webView.CoreWebView2.Navigate("https://app.local/index.html");
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Erro ao inicializar o componente WebView2:\n\n{ex.Message}\n\nVerifique se o Microsoft Edge WebView2 Runtime está instalado no Windows.",
                "Erro de Inicialização",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }
}
