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
            PdfPrint.print(
                    printAdapter,
                    printAttributes,
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
