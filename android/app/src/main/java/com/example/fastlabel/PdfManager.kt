package com.example.fastlabel

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

object PdfManager {

    /**
     * Saves a PDF document to the app-specific external storage and returns the created File.
     */
    fun savePdf(context: Context, pdfBytes: ByteArray): File? {
        return try {
            val directory = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            val timestamp = System.currentTimeMillis()
            val file = File(directory, "FastLabel_$timestamp.pdf")

            val fos = FileOutputStream(file)
            fos.write(pdfBytes)
            fos.flush()
            fos.close()

            if (file.exists() && file.length() > 0) {
                file
            } else {
                Toast.makeText(context, "Failed to save PDF", Toast.LENGTH_SHORT).show()
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Error saving PDF: ${e.message}", Toast.LENGTH_SHORT).show()
            null
        }
    }

    /**
     * Saves a PDF document to the public Downloads folder using MediaStore.
     */
    fun saveToDownloads(context: Context, pdfBytes: ByteArray) {
        val timestamp = System.currentTimeMillis()
        val filename = "FastLabel_$timestamp.pdf"

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = context.contentResolver
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                    put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }

                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { outputStream ->
                        outputStream.write(pdfBytes)
                    }
                    Toast.makeText(context, "PDF saved to Downloads", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Failed to save PDF", Toast.LENGTH_SHORT).show()
                }
            } else {
                val target = File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                    filename
                )
                val fos = FileOutputStream(target)
                fos.write(pdfBytes)
                fos.flush()
                fos.close()
                if (target.exists() && target.length() > 0) {
                    Toast.makeText(context, "PDF saved to Downloads", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Failed to save PDF", Toast.LENGTH_SHORT).show()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Error saving to Downloads: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Generates a Uri from the given file using FileProvider.
     */
    fun getUriForFile(context: Context, file: File): Uri {
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.provider",
            file
        )
    }

    /**
     * Triggers the Android Native Share Sheet for the PDF.
     */
    fun sharePdf(context: Context, file: File) {
        try {
            val uri = getUriForFile(context, file)
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(
                Intent.createChooser(shareIntent, "Share PDF")
            )
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Error sharing PDF: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
}
