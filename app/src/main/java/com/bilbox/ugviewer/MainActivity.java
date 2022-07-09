// From http://filiz.it/index.php/2021/02/25/android-tv-app-with-webview/
package com.bilbox.ugviewer;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
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

    private WebView mWebView = null;
    @Override
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
/*
        // Get the intent
        Intent intent = getIntent();
        if (AlarmClock.ACTION_SET_ALARM.equals(intent.getAction())) {
            if (intent.hasExtra(AlarmClock.EXTRA_HOUR)) {
                // Step 2: get the rest of the intent extras and set an alarm
                Log.d("OnKey", "UGviewerDBG: key pressed!");
                Toast.makeText(MainActivity.this, "key pressed!", Toast.LENGTH_SHORT).show();
            }
        }


/*
        String query = "";
        if (getIntent().getAction() != null && getIntent().getAction().equals("com.google.android.gms.actions.SEARCH_ACTION")) {
            query = getIntent().getStringExtra(SearchManager.QUERY);
            Toast.makeText(MainActivity.this, query, Toast.LENGTH_SHORT).show();
        }
*/
 
    }

    @Override
    public void onResume(){
        super.onResume();

        Log.d("debug", "UGviewerDBG: ON RESUME !");

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
    public void onBackPressed() {
        if(mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();

            this.finishAffinity();
        }
 }

/*    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if ((event.getFlags() & KeyEvent.FLAG_CANCELED_LONG_PRESS) == 0){
            //if (keyCode == KeyEvent.KEYCODE_DPAD_CENTER)
            {
                Log.d("Debug", "UGviewerDBG: keyup ::  "+keyCode);
                return true;
            }
        }
        return super.onKeyUp(keyCode, event);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event){
        if(keyCode == 10010){
            Toast.makeText(this, "UGviewerDBG:: Button X pressed", Toast.LENGTH_SHORT).show();
            //pulsarBotonTV();
            return true;
        }
        //....
        else{
            Toast.makeText(this, "UGviewerDBG: ANOTHER KEY"+keyCode, Toast.LENGTH_SHORT).show();
            Log.w("app", "UGviewerDBG: Keycode else: " + keyCode);
            return super.onKeyDown(keyCode, event);
        }

    }
*/

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

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if ((event.getAction() == KeyEvent.ACTION_DOWN)) {
            Log.w("app", "UGviewerDBG:Keycode else: " + event);
            switch(event.getKeyCode())
            {
                case KeyEvent.KEYCODE_F:
                    runJSfunction("togglefullview("+columns+")");
                    return true;
                case KeyEvent.KEYCODE_A:
                    runJSfunction("toggleautoscroll()");
                    return true;
                case KeyEvent.KEYCODE_MINUS:
                    columns -= 1;
                    if(columns<1)
                        columns = 1;
                    runJSfunction("setcolumns("+columns+")");
                    return true;
            }
        }

        return super.dispatchKeyEvent(event);
    }

}
