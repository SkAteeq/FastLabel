package com.example.fastlabel

import android.content.Context
import android.content.Intent
import android.os.Environment
import android.os.ParcelFileDescriptor
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import android.util.Base64
import android.os.Build
import android.provider.MediaStore

class WebAppInterface(private val context: Context) {
    private var hiddenWebView: WebView? = null

    @JavascriptInterface
    fun sharePdf(base64Pdf: String) {
        try {
            val pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT)
            val file = PdfManager.savePdf(context, pdfBytes)
            if (file != null) {
                PdfManager.sharePdf(context, file)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun downloadPdf(base64Pdf: String) {
        try {
            val pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT)
            PdfManager.saveToDownloads(context, pdfBytes)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun downloadHtml(htmlString: String, pageSize: String) {
        generatePdfFromHtml(htmlString, pageSize, "download")
    }

    @JavascriptInterface
    fun shareHtml(htmlString: String, pageSize: String) {
        generatePdfFromHtml(htmlString, pageSize, "share")
    }

    @JavascriptInterface
    fun printHtml(htmlString: String, pageSize: String) {
        generatePdfFromHtml(htmlString, pageSize, "print")
    }

    private fun generatePdfFromHtml(htmlString: String, pageSize: String, action: String) {
        val uiHandler = android.os.Handler(android.os.Looper.getMainLooper())
        uiHandler.post {
            val webView = WebView(context)
            hiddenWebView = webView

            webView.settings.javaScriptEnabled = false
            
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, url: String) {
                    val printAdapter = view.createPrintDocumentAdapter("FastLabel")

                    when (action) {
                        "print" -> {
                            val printManager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager
                            printManager.print("FastLabel", printAdapter, null)
                        }
                        "download", "share" -> {
                            savePdfAndExecuteAction(printAdapter, action, pageSize)
                        }
                    }
                }
            }

            // Ensure rendering has context
            webView.loadDataWithBaseURL(null, htmlString, "text/html", "UTF-8", null)
        }
    }

    private fun savePdfAndExecuteAction(printAdapter: android.print.PrintDocumentAdapter, action: String, pageSize: String) {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val fileName = "FastLabel_$timestamp.pdf"

        val pfd: ParcelFileDescriptor?
        val destFile: File?

        if (action == "download" && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val resolver = context.contentResolver
            val contentValues = android.content.ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            if (uri != null) {
                pfd = resolver.openFileDescriptor(uri, "rw")
            } else {
                return
            }
            destFile = null
        } else {
            val dir = if (action == "download") {
                @Suppress("DEPRECATION")
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            } else {
                context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS) ?: context.cacheDir
            }
            dir.mkdirs()
            destFile = File(dir, fileName)
            destFile.createNewFile()
            pfd = ParcelFileDescriptor.open(destFile, ParcelFileDescriptor.MODE_READ_WRITE)
        }

        if (pfd == null) return

        try {
            val mediaSize = if (pageSize == "A5") PrintAttributes.MediaSize.ISO_A5 else PrintAttributes.MediaSize.ISO_A6
            
            printAdapter.onLayout(
                null,
                PrintAttributes.Builder().setMediaSize(mediaSize).build(),
                null,
                object : android.print.PrintDocumentAdapter.LayoutResultCallback() {},
                null
            )

            printAdapter.onWrite(
                arrayOf(android.print.PageRange.ALL_PAGES),
                pfd,
                null,
                object : android.print.PrintDocumentAdapter.WriteResultCallback() {
                    override fun onWriteFinished(pages: Array<out android.print.PageRange>?) {
                        super.onWriteFinished(pages)
                        try { pfd.close() } catch(e: Exception) {}

                        if (action == "share" && destFile != null) {
                            sharePdfFile(destFile)
                        } else if (action == "download") {
                            android.os.Handler(android.os.Looper.getMainLooper()).post {
                                android.widget.Toast.makeText(context, "PDF saved to Downloads", android.widget.Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                }
            )
        } catch (e: Exception) {
            e.printStackTrace()
            try { pfd.close() } catch (e2: Exception) {}
        }
    }

    private fun sharePdfFile(file: File) {
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        
        context.startActivity(Intent.createChooser(intent, "Share PDF"))
    }
}
