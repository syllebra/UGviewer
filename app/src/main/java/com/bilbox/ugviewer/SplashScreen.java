package com.bilbox.ugviewer;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

public class SplashScreen extends Activity {
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);

        Activity splash = this;

        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            public void run() {
                // Open main activity from splash
                Intent intent = new Intent(splash,MainActivity.class);
                startActivity(intent);
                finish();
            }
        }, 1000);

    }
}
