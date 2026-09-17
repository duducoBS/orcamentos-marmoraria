using Android.App;
using Android.Content;
using Android.OS;
using Android.Print;
using Android.Views;
using Android.Webkit;

namespace OrcamentosMarmoraria;

[Activity(
    Label = "Orçamentos Marmoraria",
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

        _webView.SetWebViewClient(new CustomWebViewClient(this));
        _webView.SetWebChromeClient(new CustomWebChromeClient(this));

        // Expõe interface JavaScript para impressão nativa do Android
        _webView.AddJavascriptInterface(new AndroidPrintInterface(this, _webView), "AndroidPrinter");

        SetContentView(_webView);

        _webView.LoadUrl("file:///android_asset/www/index.html");
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
    private readonly Activity _activity;

    public CustomWebViewClient(Activity activity)
    {
        _activity = activity;
    }

    public override bool ShouldOverrideUrlLoading(WebView? view, IWebResourceRequest? request)
    {
        if (request?.Url == null) return false;
        var url = request.Url.ToString();

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
                // Se não tiver WhatsApp instalado, abre no navegador padrão
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
    private readonly Activity _activity;

    public CustomWebChromeClient(Activity activity)
    {
        _activity = activity;
    }
}

public class AndroidPrintInterface : Java.Lang.Object
{
    private readonly Activity _activity;
    private readonly WebView _webView;

    public AndroidPrintInterface(Activity activity, WebView webView)
    {
        _activity = activity;
        _webView = webView;
    }

    [JavascriptInterface]
    public void Print()
    {
        _activity.RunOnUiThread(() =>
        {
            var printManager = (PrintManager?)_activity.GetSystemService(Context.PrintService);
            if (printManager != null)
            {
                var printAdapter = _webView.CreatePrintDocumentAdapter("Orcamento_Marmoraria");
                printManager.Print("Orçamento Marmoraria", printAdapter, new PrintAttributes.Builder().Build());
            }
        });
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