package com.example.fastlabel;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onResume() {
        super.onResume();
        WebView webView = this.getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new WebAppInterface(this), "AndroidBridge");
        }
    }
}
