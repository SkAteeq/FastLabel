package android.print;

import android.os.ParcelFileDescriptor;
import android.os.CancellationSignal;

public class PdfPrint {

    public interface Callback {
        void onSuccess();
        void onFailure();
    }

    public static void print(final PrintDocumentAdapter adapter, final PrintAttributes attributes, final ParcelFileDescriptor pfd, final Callback callback) {
        adapter.onLayout(null, attributes, new CancellationSignal(), new PrintDocumentAdapter.LayoutResultCallback() {
            @Override
            public void onLayoutFinished(PrintDocumentInfo info, boolean changed) {
                adapter.onWrite(new PageRange[]{PageRange.ALL_PAGES}, pfd, new CancellationSignal(), new PrintDocumentAdapter.WriteResultCallback() {
                    @Override
                    public void onWriteFinished(PageRange[] pages) {
                        if (callback != null) callback.onSuccess();
                    }

                    @Override
                    public void onWriteFailed(CharSequence error) {
                        if (callback != null) callback.onFailure();
                    }
                });
            }

            @Override
            public void onLayoutFailed(CharSequence error) {
                if (callback != null) callback.onFailure();
            }
        }, null);
    }
}
