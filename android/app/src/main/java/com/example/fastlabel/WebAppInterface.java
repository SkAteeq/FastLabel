package com.example.fastlabel;

import android.content.Context;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import java.io.File;

public class WebAppInterface {
    private Context context;

    public WebAppInterface(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public void sharePdf(String base64Pdf) {
        try {
            byte[] pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT);
            File file = PdfManager.savePdf(context, pdfBytes);
            if (file != null) {
                PdfManager.sharePdf(context, file);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @JavascriptInterface
    public void downloadPdf(String base64Pdf) {
        try {
            byte[] pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT);
            PdfManager.saveToDownloads(context, pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
