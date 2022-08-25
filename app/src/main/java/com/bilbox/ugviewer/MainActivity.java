// From http://filiz.it/index.php/2021/02/25/android-tv-app-with-webview/
package com.bilbox.ugviewer;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.provider.AlarmClock;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

public class MainActivity extends Activity {

    public void visible(){
        WebView webview = (WebView) findViewById(R.id.main_webview);
        ImageView logo = (ImageView) findViewById(R.id.imageView1);
        ProgressBar bar = (ProgressBar) findViewById(R.id.progressBar1);
        TextView version = (TextView) findViewById(R.id.textView1);
        logo.setVisibility(View.GONE);
        bar.setVisibility(View.GONE);
        version.setVisibility(View.GONE);
        webview.setVisibility(View.VISIBLE);
    }

    public void unvisible(){
        WebView webview = (WebView) findViewById(R.id.main_webview);
        ImageView logo = (ImageView) findViewById(R.id.imageView1);
        ProgressBar bar = (ProgressBar) findViewById(R.id.progressBar1);
        TextView version = (TextView) findViewById(R.id.textView1);
        webview.setVisibility(View.GONE);
        logo.setVisibility(View.VISIBLE);
        bar.setVisibility(View.VISIBLE);
        version.setVisibility(View.VISIBLE);
    }

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
    PageType mPageType = PageType.OTHERS;

    enum CommandMode {NORMAL, SIZE, OTHERS}
    CommandMode mCommandMode = CommandMode.NORMAL;

    private WebView mWebView = null;

    @Override
    public void onDestroy() {
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        super.onDestroy();
    }

    @Override
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_main);

        mWebView = findViewById(R.id.main_webview);

        // Force links and redirects to open in the WebView instead of in a browser
        mWebView.setWebViewClient(new WebViewClient() {

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                Log.w("app", "UGviewerDBG:Page started" + url);
                unvisible();
            }

            @Override
            public void onPageFinished(WebView view, String url) {

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
                visible();
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
    protected int font_size = 15;

    protected void saveTabOptions()
    {
        SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putInt(mWebView.getUrl()+"_COLS", columns);
        editor.putInt(mWebView.getUrl()+"_FONT_SIZE", font_size);
        editor.apply();
    }
    protected void loadTabOptions()
    {
        SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        columns = sharedPref.getInt(mWebView.getUrl()+"_COLS", 4);
        font_size = sharedPref.getInt(mWebView.getUrl()+"_FONT_SIZE", 15);
    }

    protected void setupPage() {
        if (mWebView.getUrl().contains("tabs.ultimate-guitar.com")) {
            mPageType = PageType.TAB_CHORDS;
            loadTabOptions();
            toggleFullView();
        }
        else
        if (mWebView.getUrl().contains("ultimate-guitar.com/user/mytabs")) {
            mPageType = PageType.TABS_LIST;
            toggleFullView();
        }
    }

    public void toggleFullView() {
        switch(mPageType) {
            case TAB_CHORDS:
                runJSfunction("toggle_tab_full_view(" + columns + ")");
                runJSfunction("force_current_font_size("+font_size+")");
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

    public void changeFontSize(int change)
    {
        font_size += change;
        if(font_size<5)
            font_size = 5;
        runJSfunction("force_current_font_size("+font_size+")");
        saveTabOptions();
    }

    public void changeColumnsCount(int change)
    {
        columns += change;
        if(columns<1)
            columns = 5;
        runJSfunction("setcolumns("+columns+")");
        saveTabOptions();
    }

    public void changeTranspose(int semitones)
    {
        if(semitones<0)
            runJSfunction("generate_click(document.dec_transpose_button)");
        else if(semitones>0)
            runJSfunction("generate_click(document.inc_transpose_button)");
        //saveTabOptions();
    }

    public void setCommandMode(CommandMode mode)
    {
        mCommandMode = mode;
        if(mCommandMode!=CommandMode.NORMAL)
            runJSfunction("showInfoZone(\""+mCommandMode.toString()+"\")");
        else
            runJSfunction("showInfoZone(\"\")");
    }

    public void toggleCommandMode()
    {
        switch(mCommandMode) {
            case NORMAL: setCommandMode(CommandMode.OTHERS); break;
            case OTHERS: setCommandMode(CommandMode.SIZE); break;
            case SIZE: setCommandMode(CommandMode.NORMAL); break;
        }
        Log.w("app","Changed command mode to:" + mCommandMode);
    }

    @Override
    public void onBackPressed() {
        if(mCommandMode != CommandMode.NORMAL) {
            setCommandMode(CommandMode.NORMAL);
        }
        else
        if(mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            this.finishAffinity();
            System.exit(0);
            super.onBackPressed();
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {

        if ((event.getAction() == KeyEvent.ACTION_DOWN)) {
            Log.w("app", "UGviewerDBG:Keycode else: " + event);
            switch(event.getKeyCode())
            {
                case KeyEvent.KEYCODE_F:
                case KeyEvent.KEYCODE_TV_INPUT:
                    toggleFullView();
                    return event.getKeyCode() != KeyEvent.KEYCODE_F;
                case KeyEvent.KEYCODE_A:
                case KeyEvent.KEYCODE_MEDIA_PLAY:
                case 4056: // TCL small command "Multicolor"
                    runJSfunction("toggleautoscroll()");
                    return event.getKeyCode() != KeyEvent.KEYCODE_A;
                case KeyEvent.KEYCODE_O:
                case KeyEvent.KEYCODE_PROG_RED:
                    changeFontSize(-2);
                    return event.getKeyCode() != KeyEvent.KEYCODE_O;
                case KeyEvent.KEYCODE_P:
                case KeyEvent.KEYCODE_PROG_GREEN:
                    changeFontSize(+2);
                    return event.getKeyCode() != KeyEvent.KEYCODE_P;
                case KeyEvent.KEYCODE_C:
                case 4020: // TCL command "T_ROND"
                    runJSfunction("toggle_chords_type(1)");
                    return event.getKeyCode() != KeyEvent.KEYCODE_C;
                case KeyEvent.KEYCODE_L:
                case KeyEvent.KEYCODE_MEDIA_REWIND:
                    changeColumnsCount(-1);
                    return event.getKeyCode() != KeyEvent.KEYCODE_L;
                case KeyEvent.KEYCODE_M:
                case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD:
                    changeColumnsCount(+1);
                    return event.getKeyCode() != KeyEvent.KEYCODE_M;
                case KeyEvent.KEYCODE_U:
                    changeTranspose(-1);
                    return event.getKeyCode() != KeyEvent.KEYCODE_U;
                case KeyEvent.KEYCODE_I:
                    changeTranspose(+1);
                    return event.getKeyCode() != KeyEvent.KEYCODE_I;
                case KeyEvent.KEYCODE_1:
                case KeyEvent.KEYCODE_2:
                case KeyEvent.KEYCODE_3:
                case KeyEvent.KEYCODE_4:
                case KeyEvent.KEYCODE_5:
                case KeyEvent.KEYCODE_6:
                case KeyEvent.KEYCODE_7:
                case KeyEvent.KEYCODE_8:
                case KeyEvent.KEYCODE_9:
                    changeColumnsCount((int)(event.getKeyCode())-(int)(KeyEvent.KEYCODE_0)-columns);
                    break;

                case KeyEvent.KEYCODE_S:
                case KeyEvent.KEYCODE_MENU:
                    toggleCommandMode();
                    return event.getKeyCode() != KeyEvent.KEYCODE_S;
            }

            if(mCommandMode == CommandMode.SIZE)
            {
                switch(event.getKeyCode())
                {
                    case KeyEvent.KEYCODE_DPAD_DOWN:
                        changeFontSize(-2);
                        return true;
                    case KeyEvent.KEYCODE_DPAD_UP:
                        changeFontSize(2);
                        return true;
                    case KeyEvent.KEYCODE_DPAD_LEFT:
                        changeColumnsCount(-1);
                        return true;
                    case KeyEvent.KEYCODE_DPAD_RIGHT:
                        changeColumnsCount(1);
                        return true;
                }
            }
            else
            if(mCommandMode == CommandMode.OTHERS)
            {
                switch(event.getKeyCode())
                {
                    case KeyEvent.KEYCODE_DPAD_DOWN:
                        runJSfunction("toggle_chords_type(-1)");
                        return true;
                    case KeyEvent.KEYCODE_DPAD_UP:
                        runJSfunction("toggle_chords_type(1)");
                        return true;
                    case KeyEvent.KEYCODE_DPAD_LEFT:
                        changeTranspose(-1);
                        return true;
                    case KeyEvent.KEYCODE_DPAD_RIGHT:
                        changeTranspose(1);
                        return true;
                }
            }

        }
        else
        {
            switch(event.getKeyCode())
            {
                case KeyEvent.KEYCODE_TV_INPUT:
                case KeyEvent.KEYCODE_MEDIA_PLAY:
                case 4056: // TCL small command "Multicolor"
                case KeyEvent.KEYCODE_PROG_RED:
                case KeyEvent.KEYCODE_PROG_GREEN:
                case 4020: // TCL command "T_ROND"
                case KeyEvent.KEYCODE_MEDIA_REWIND:
                case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD:
                case KeyEvent.KEYCODE_MENU:
                    return true;
                case KeyEvent.KEYCODE_DPAD_DOWN:
                case KeyEvent.KEYCODE_DPAD_UP:
                case KeyEvent.KEYCODE_DPAD_LEFT:
                case KeyEvent.KEYCODE_DPAD_RIGHT:
                    return mCommandMode != CommandMode.NORMAL;
            }
        }

        return super.dispatchKeyEvent(event);
    }

}
