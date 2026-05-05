package com.example.fastlabel;

import android.os.ParcelFileDescriptor;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PdfPrint;

public class PdfConverter {
    
    public interface Callback {
        void onSuccess();
        void onFailure();
    }

    public static void convertPrintAdapter(
            PrintDocumentAdapter printAdapter,
            PrintAttributes printAttributes,
            ParcelFileDescriptor destination,
            Callback callback) {
        try {
            // Set high quality resolution (300 DPI for better PDF quality)
            PrintAttributes.Resolution resolution = new PrintAttributes.Resolution("pdf", "pdf", 300, 300);
            
            PrintAttributes qualityAttributes = new PrintAttributes.Builder()
                .setMediaSize(printAttributes.getMediaSize())
                .setResolution(resolution)
                .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                .build();
            
            PdfPrint.print(
                    printAdapter,
                    qualityAttributes,
                    destination,
                    new PdfPrint.Callback() {
                        @Override
                        public void onSuccess() {
                            if (callback != null) {
                                callback.onSuccess();
                            }
                        }

                        @Override
                        public void onFailure() {
                            if (callback != null) {
                                callback.onFailure();
                            }
                        }
                    }
            );
        } catch (Exception e) {
            if (callback != null) {
                callback.onFailure();
            }
        }
    }
}
