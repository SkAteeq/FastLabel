package com.example.fastlabel;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;

public class PdfManager {

    public static File savePdf(final Context context, byte[] pdfBytes) {
        try {
            File directory = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
            long timestamp = System.currentTimeMillis();
            File file = new File(directory, "FastLabel_" + timestamp + ".pdf");

            FileOutputStream fos = new FileOutputStream(file);
            fos.write(pdfBytes);
            fos.flush();
            fos.close();

            if (file.exists() && file.length() > 0) {
                return file;
            } else {
                showToast(context, "Failed to save PDF temporarily");
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            showToast(context, "Error saving PDF: " + e.getMessage());
            return null;
        }
    }

    public static void saveToDownloads(final Context context, byte[] pdfBytes) {
        long timestamp = System.currentTimeMillis();
        String filename = "FastLabel_" + timestamp + ".pdf";

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                android.content.ContentResolver resolver = context.getContentResolver();
                ContentValues contentValues = new ContentValues();
                contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues);
                if (uri != null) {
                    java.io.OutputStream outputStream = resolver.openOutputStream(uri);
                    if (outputStream != null) {
                        outputStream.write(pdfBytes);
                        outputStream.close();
                    }
                    showToast(context, "PDF saved to Downloads!");
                } else {
                    showToast(context, "Failed to save PDF");
                }
            } else {
                File target = new File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                    filename
                );
                FileOutputStream fos = new FileOutputStream(target);
                fos.write(pdfBytes);
                fos.flush();
                fos.close();
                if (target.exists() && target.length() > 0) {
                    showToast(context, "PDF saved to Downloads!");
                } else {
                    showToast(context, "Failed to save PDF");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            showToast(context, "Error saving to Downloads: " + e.getMessage());
        }
    }

    private static void showToast(final Context context, final String message) {
        new android.os.Handler(android.os.Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
            }
        });
    }

    public static Uri getUriForFile(Context context, File file) {
        return FileProvider.getUriForFile(
            context,
            context.getPackageName() + ".fileprovider",
            file
        );
    }

    public static void sharePdf(Context context, File file) {
        try {
            Uri uri = getUriForFile(context, file);
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("application/pdf");
            shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            context.startActivity(
                Intent.createChooser(shareIntent, "Share PDF")
            );
        } catch (Exception e) {
            e.printStackTrace();
            showToast(context, "Error sharing PDF: " + e.getMessage());
        }
    }
}
