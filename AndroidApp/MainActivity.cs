using Android.App;
using Android.Content;
using Android.OS;
using Android.Print;
using Android.Views;
using Android.Webkit;

namespace OrcamentosMarmoraria;

[Activity(
    Label = "Orçamentos",
    Icon = "@mipmap/appicon",
    RoundIcon = "@mipmap/appicon_round",
    MainLauncher = true,
    Theme = "@android:style/Theme.NoTitleBar.Fullscreen",
    ConfigurationChanges = Android.Content.PM.ConfigChanges.Orientation | Android.Content.PM.ConfigChanges.ScreenSize
)]
public class MainActivity : Activity
{
    private WebView? _webView;

    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        _webView = new WebView(this)
        {
            LayoutParameters = new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MatchParent,
                ViewGroup.LayoutParams.MatchParent
            )
        };

        var settings = _webView.Settings;
        settings.JavaScriptEnabled = true;
        settings.DomStorageEnabled = true;
        settings.DatabaseEnabled = true;
        settings.AllowFileAccess = true;
        settings.AllowFileAccessFromFileURLs = true;
        settings.AllowUniversalAccessFromFileURLs = true;
        settings.SetSupportZoom(true);
        settings.BuiltInZoomControls = true;
        settings.DisplayZoomControls = false;
        settings.UseWideViewPort = true;
        settings.LoadWithOverviewMode = true;

        _webView.SetWebViewClient(new CustomWebViewClient(this));
        _webView.SetWebChromeClient(new CustomWebChromeClient(this));

        _webView.AddJavascriptInterface(new AndroidPrintInterface(this, _webView), "AndroidPrinter");

        SetContentView(_webView);

        _webView.LoadUrl("file:///android_asset/www/index.html");
    }

    public void PrintDocument()
    {
        RunOnUiThread(() =>
        {
            try
            {
                var printManager = (PrintManager?)GetSystemService(Context.PrintService);
                if (printManager != null && _webView != null)
                {
                    var printAdapter = _webView.CreatePrintDocumentAdapter("Orcamento_Marmoraria");
                    var printAttributes = new PrintAttributes.Builder()
                        .SetMediaSize(PrintAttributes.MediaSize.IsoA4)
                        .SetMinMargins(PrintAttributes.Margins.NoMargins)
                        .Build();

                    printManager.Print("Orçamento Marmoraria", printAdapter, printAttributes);
                }
            }
            catch (System.Exception ex)
            {
                Android.Widget.Toast.MakeText(this, "Erro ao abrir impressão: " + ex.Message, Android.Widget.ToastLength.Long)?.Show();
            }
        });
    }

    public override bool OnKeyDown(Keycode keyCode, KeyEvent? e)
    {
        if (keyCode == Keycode.Back)
        {
            // Volta da aba de preview para a aba de formulário se estiver na preview
            _webView?.EvaluateJavascript("if (document.body.classList.contains('tab-preview-active')) { alternarAbaMobile('form'); true; } else { false; }", new ValueCallback(res =>
            {
                if (res != null && res.ToString() == "true")
                {
                    // Consumido
                }
                else
                {
                    Finish();
                }
            }));
            return true;
        }

        return base.OnKeyDown(keyCode, e);
    }
}

public class CustomWebViewClient : WebViewClient
{
    private readonly MainActivity _activity;

    public CustomWebViewClient(MainActivity activity)
    {
        _activity = activity;
    }

    public override bool ShouldOverrideUrlLoading(WebView? view, IWebResourceRequest? request)
    {
        if (request?.Url == null) return false;
        return HandleCustomUrl(request.Url.ToString());
    }

    public override bool ShouldOverrideUrlLoading(WebView? view, string? url)
    {
        if (string.IsNullOrEmpty(url)) return false;
        return HandleCustomUrl(url);
    }

    private bool HandleCustomUrl(string url)
    {
        // Intercepta comando de impressão nativa
        if (url.StartsWith("app://print") || url.StartsWith("action://print"))
        {
            _activity.PrintDocument();
            return true;
        }

        // Links de WhatsApp ou externos abrem no aplicativo nativo
        if (url.StartsWith("whatsapp://") || url.Contains("api.whatsapp.com") || url.Contains("wa.me"))
        {
            try
            {
                var intent = new Intent(Intent.ActionView, Android.Net.Uri.Parse(url));
                _activity.StartActivity(intent);
                return true;
            }
            catch
            {
                var intent = new Intent(Intent.ActionView, Android.Net.Uri.Parse(url));
                _activity.StartActivity(intent);
                return true;
            }
        }

        return false;
    }
}

public class CustomWebChromeClient : WebChromeClient
{
    private readonly MainActivity _activity;

    public CustomWebChromeClient(MainActivity activity)
    {
        _activity = activity;
    }

    // Interceptação via JS Prompt (bridge 100% compatível em todas as versões do Android)
    public override bool OnJsPrompt(WebView? view, string? url, string? message, string? defaultValue, JsPromptResult? result)
    {
        if (message == "ANDROID_PRINT")
        {
            _activity.PrintDocument();
            result?.Confirm("OK");
            return true;
        }
        return base.OnJsPrompt(view, url, message, defaultValue, result);
    }
}

public class AndroidPrintInterface : Java.Lang.Object
{
    private readonly MainActivity _activity;
    private readonly WebView _webView;

    public AndroidPrintInterface(MainActivity activity, WebView webView)
    {
        _activity = activity;
        _webView = webView;
    }

    [JavascriptInterface]
    public void Print()
    {
        _activity.PrintDocument();
    }
}

public class ValueCallback : Java.Lang.Object, IValueCallback
{
    private readonly System.Action<Java.Lang.Object?> _callback;

    public ValueCallback(System.Action<Java.Lang.Object?> callback)
    {
        _callback = callback;
    }

    public void OnReceiveValue(Java.Lang.Object? value)
    {
        _callback(value);
    }
}