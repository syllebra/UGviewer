// From http://filiz.it/index.php/2021/02/25/android-tv-app-with-webview/
package com.bilbox.ugviewer;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.provider.AlarmClock;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

public class MainActivity extends Activity {

    public static String loadTextFromAssets(Context context, String assetsPath, Charset charset) throws IOException {
        InputStream is = context.getAssets().open(assetsPath);
        byte[] buffer = new byte[1024];
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        for (int length = is.read(buffer); length != -1; length = is.read(buffer)) {
            baos.write(buffer, 0, length);
        }
        is.close();
        baos.close();
        return charset == null ? new String(baos.toByteArray()) : new String(baos.toByteArray(), charset);
    }

    enum PageType {OTHERS, TABS_LIST, TAB_CHORDS};
    PageType pageType = PageType.OTHERS;

    private WebView mWebView = null;
    @Override
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        mWebView = findViewById(R.id.main_webview);

        // Force links and redirects to open in the WebView instead of in a browser
        mWebView.setWebViewClient(new WebViewClient() {
            public void onPageFinished(WebView view, String url) {
                /*view.loadUrl("javascript:window.ANDROID_CLIENT.showSource("
                        + "document.getElementsByTagName('html')[0].innerHTML);");
                view.loadUrl("javascript:window.ANDROID_CLIENT.showDescription("
                        + "document.querySelector('meta[name=\"share-description\"]').getAttribute('content')"
                        + ");");*/
                Log.w("app", "UGviewerDBG:Page reload" + url);

                try {
                    String script = loadTextFromAssets(MainActivity.this, "UGviewer.js", Charset.defaultCharset());
                    mWebView.evaluateJavascript(script, new ValueCallback<String>() {
                        @Override
                        public void onReceiveValue(String value) {
                            Log.d("output", value);
                            //prints:"JavaScript executed successfully."
                        }
                    });
                }
                catch (IOException e) {
                    e.printStackTrace();
                }

                setupPage();
                super.onPageFinished(view, url);
            }
        });

        mWebView.getSettings().setUserAgentString("Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36");

        mWebView.addJavascriptInterface(this, "AndroidInterface");

        mWebView.getSettings().setDomStorageEnabled(true);
        mWebView.getSettings().setAppCacheEnabled(false);
        mWebView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        mWebView.getSettings().setJavaScriptEnabled(true);
        mWebView.getSettings().setLoadWithOverviewMode(true);
        mWebView.getSettings().setUseWideViewPort(true);

        mWebView.getSettings().setSupportZoom(true);
        mWebView.getSettings().setBuiltInZoomControls(true);
        mWebView.getSettings().setDisplayZoomControls(false);

        mWebView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
        mWebView.setScrollbarFadingEnabled(false);

        //webView.loadUrl("https://tabs.ultimate-guitar.com/tab/johnny-hallyday/je-te-promets-chords-1107944");
        mWebView.loadUrl("https://www.ultimate-guitar.com/user/mytabs");///tab/print?auto_export=1&flats=0&font_size=0&id=1107944&is_ukulele=0&simplified=0&transpose=0");

    }

    @Override
    public void onResume(){
        super.onResume();
        Log.d("debug", "UGviewerDBG: ON RESUME !");
    }

    @Override
    public void onBackPressed() {
        if(mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            this.finishAffinity();
            System.exit(0);
            super.onBackPressed();
        }
    }

    protected void setupPage() {
        if (mWebView.getUrl().contains("tabs.ultimate-guitar.com")) {
            pageType = PageType.TAB_CHORDS;
            loadTabOptions();
            toggleFullView();
        }
        else
        if (mWebView.getUrl().contains("ultimate-guitar.com/user/mytabs")) {
            pageType = PageType.TABS_LIST;
            toggleFullView();
        }
    }

    public void toggleFullView() {
        switch(pageType) {
            case TAB_CHORDS:
                runJSfunction("toggle_tab_full_view(" + columns + ")");
                break;
            case TABS_LIST:
                runJSfunction("set_tabs_list_all()");
                runJSfunction("toggle_full_view(" + columns + ")");
                break;
            default:
                runJSfunction("toggle_full_view(" + columns + ")");
                break;
        }
    }

    @JavascriptInterface
    public void onClicked()
    {
        Log.d("HelpButton", "Help button clicked");
    }

    protected void runJSfunction(String function)
    {
        try {
            String script = function+";";
            mWebView.evaluateJavascript(script, new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    Log.d("output", value);
                    //prints:"JavaScript executed successfully."
                }
            });
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected int columns = 4;

    protected void saveTabOptions()
    {
        SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putInt(mWebView.getUrl()+"_COLS", columns);
        editor.apply();
    }
    protected void loadTabOptions()
    {
        SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        columns = sharedPref.getInt(mWebView.getUrl()+"_COLS", 4);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if ((event.getAction() == KeyEvent.ACTION_DOWN)) {
            Log.w("app", "UGviewerDBG:Keycode else: " + event);
            switch(event.getKeyCode())
            {
                case KeyEvent.KEYCODE_F:
                case KeyEvent.KEYCODE_0:
                    toggleFullView();
                    break;
                case KeyEvent.KEYCODE_A:
                case KeyEvent.KEYCODE_MEDIA_PLAY:
                    runJSfunction("toggleautoscroll()");
                    break;
                case KeyEvent.KEYCODE_O:
                    runJSfunction("generate_click(document.dec_font_button)");
                    break;
                case KeyEvent.KEYCODE_P:
                    runJSfunction("generate_click(document.inc_font_button)");
                    break;
                case KeyEvent.KEYCODE_C:
                    runJSfunction("toggle_chords_type()");
                    break;
                case KeyEvent.KEYCODE_L:
                case KeyEvent.KEYCODE_MEDIA_REWIND:
                    columns -= 1;
                    if(columns<1)
                        columns = 1;
                    runJSfunction("setcolumns("+columns+")");
                    saveTabOptions();
                    break;
                case KeyEvent.KEYCODE_M:
                case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD:
                    columns += 1;
                    runJSfunction("setcolumns("+columns+")");
                    saveTabOptions();
                    break;
                case KeyEvent.KEYCODE_1:
                case KeyEvent.KEYCODE_2:
                case KeyEvent.KEYCODE_3:
                case KeyEvent.KEYCODE_4:
                case KeyEvent.KEYCODE_5:
                case KeyEvent.KEYCODE_6:
                case KeyEvent.KEYCODE_7:
                case KeyEvent.KEYCODE_8:
                case KeyEvent.KEYCODE_9:
                    columns = (int)(event.getKeyCode())-(int)(KeyEvent.KEYCODE_0);
                    runJSfunction("setcolumns("+columns+")");
                    break;
            }
        }

        return super.dispatchKeyEvent(event);
    }

}
