package com.example.fastlabel;

import android.content.Context;
import android.content.Intent;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.content.FileProvider;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import android.util.Base64;
import android.os.Build;
import android.provider.MediaStore;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

public class WebAppInterface {
    private Context context;
    private WebView hiddenWebView;

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

    @JavascriptInterface
    public void downloadHtml(String htmlString, String pageSize) {
        generatePdfFromHtml(htmlString, pageSize, "download");
    }

    @JavascriptInterface
    public void shareHtml(String htmlString, String pageSize) {
        generatePdfFromHtml(htmlString, pageSize, "share");
    }

    @JavascriptInterface
    public void printHtml(String htmlString, String pageSize) {
        generatePdfFromHtml(htmlString, pageSize, "print");
    }

    private void generatePdfFromHtml(String htmlString, String pageSize, String action) {
        Handler uiHandler = new Handler(Looper.getMainLooper());
        uiHandler.post(new Runnable() {
            @Override
            public void run() {
                WebView webView = new WebView(context);
                hiddenWebView = webView;

                webView.getSettings().setJavaScriptEnabled(false);
                
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        android.print.PrintDocumentAdapter printAdapter = view.createPrintDocumentAdapter("FastLabel");

                        if ("print".equals(action)) {
                            PrintManager printManager = (PrintManager) context.getSystemService(Context.PRINT_SERVICE);
                            printManager.print("FastLabel", printAdapter, null);
                        } else if ("download".equals(action) || "share".equals(action)) {
                            savePdfAndExecuteAction(printAdapter, action, pageSize);
                        }
                    }
                });

                webView.loadDataWithBaseURL(null, htmlString, "text/html", "UTF-8", null);
            }
        });
    }

    private void savePdfAndExecuteAction(android.print.PrintDocumentAdapter printAdapter, String action, String pageSize) {
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        String fileName = "FastLabel_" + timestamp + ".pdf";

        ParcelFileDescriptor pfd = null;
        File destFile = null;

        if ("download".equals(action) && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            android.content.ContentResolver resolver = context.getContentResolver();
            android.content.ContentValues contentValues = new android.content.ContentValues();
            contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
            contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
            contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

            android.net.Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues);
            if (uri != null) {
                try {
                    pfd = resolver.openFileDescriptor(uri, "rw");
                } catch (Exception e) {}
            }
            if (pfd == null) return;
        } else {
            File dir;
            if ("download".equals(action)) {
                dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            } else {
                dir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
                if (dir == null) dir = context.getCacheDir();
            }
            dir.mkdirs();
            destFile = new File(dir, fileName);
            try {
                destFile.createNewFile();
                pfd = ParcelFileDescriptor.open(destFile, ParcelFileDescriptor.MODE_READ_WRITE);
            } catch(Exception e) {}
        }

        if (pfd == null) return;

        try {
            PrintAttributes.MediaSize mediaSize = "A5".equals(pageSize) ? PrintAttributes.MediaSize.ISO_A5 : PrintAttributes.MediaSize.ISO_A6;
            final ParcelFileDescriptor finalPfd = pfd;
            final File finalDestFile = destFile;
            
            printAdapter.onLayout(
                null,
                new PrintAttributes.Builder().setMediaSize(mediaSize).build(),
                null,
                new android.print.PrintDocumentAdapter.LayoutResultCallback() {},
                null
            );

            printAdapter.onWrite(
                new android.print.PageRange[]{android.print.PageRange.ALL_PAGES},
                pfd,
                null,
                new android.print.PrintDocumentAdapter.WriteResultCallback() {
                    @Override
                    public void onWriteFinished(android.print.PageRange[] pages) {
                        super.onWriteFinished(pages);
                        try { finalPfd.close(); } catch(Exception e) {}

                        if ("share".equals(action) && finalDestFile != null) {
                            sharePdfFile(finalDestFile);
                        } else if ("download".equals(action)) {
                            new Handler(Looper.getMainLooper()).post(new Runnable() {
                                @Override
                                public void run() {
                                    Toast.makeText(context, "PDF saved to Downloads", Toast.LENGTH_LONG).show();
                                }
                            });
                        }
                    }
                }
            );
        } catch (Exception e) {
            e.printStackTrace();
            try { pfd.close(); } catch (Exception e2) {}
        }
    }

    private void sharePdfFile(File file) {
        android.net.Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
        
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setType("application/pdf");
        intent.putExtra(Intent.EXTRA_STREAM, uri);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        
        context.startActivity(Intent.createChooser(intent, "Share PDF"));
    }
}
