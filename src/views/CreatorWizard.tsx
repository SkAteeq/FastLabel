import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ClipboardPaste, Printer, Search, PlusCircle, CheckCircle2, Share2, Download, Settings } from 'lucide-react';
import { SenderProfile, LabelRecord } from '../types';

type PageSize = 'A6' | 'A5';

const PAGE_SIZE_DIMENSIONS: Record<PageSize, [number, number]> = {
  'A6': [1240, 1748],
  'A5': [1748, 2480]
};
import { saveLabel } from '../db';
import { PrintableLabel } from '../components/PrintableLabel';
import toast from 'react-hot-toast';

interface CreatorWizardProps {
  sender: SenderProfile;
  initialLabel?: LabelRecord;
  initialStep?: number;
  onFinish: () => void;
}

export function CreatorWizard({ sender, initialLabel, initialStep = 1, onFinish }: CreatorWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [label, setLabel] = useState<LabelRecord>(() => {
    if (initialLabel) {
      return {
        orderId: '',
        ...initialLabel
      };
    }
    const randomId = `ORD-${String(Math.floor(Date.now() / 1000)).slice(-6)}`;
    return {
      recipient: { name: '', phone: '', address: '' },
      productDetails: '',
      timestamp: Date.now(),
      orderId: randomId
    };
  });

  const [pageSize, setPageSize] = useState<PageSize>('A6');

  // Load initial setting
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fastlabel_pagesize') as PageSize;
      if (saved && PAGE_SIZE_DIMENSIONS[saved]) {
        setPageSize(saved);
      }
    } catch(e){}
  }, []);

  const handlePageSizeChange = (newSize: PageSize) => {
    if (pageSize === newSize) {
      toast('No update necessary, settings are unchanged.', { icon: 'ℹ️' });
      return;
    }
    setPageSize(newSize);
    try {
      localStorage.setItem('fastlabel_pagesize', newSize);
      toast.success('Page size updated successfully. The changes are now reflected in the preview.');
    } catch(e){
      toast.error('Unable to save the changes. Please try again.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let name = label.recipient.name;
      let phone = label.recipient.phone;
      const addressParts: string[] = [];

      lines.forEach(line => {
        if (/^\+?\d[\d\s-]{8,}\d$/.test(line) && !phone) {
          phone = line;
        } else if (!name && line.length < 40 && !line.match(/\d/)) {
          name = line;
        } else {
          addressParts.push(line);
        }
      });

      setLabel(prev => ({
        ...prev,
        recipient: {
          name: name || prev.recipient.name,
          phone: phone || prev.recipient.phone,
          address: addressParts.join('\n') || prev.recipient.address
        }
      }));
      toast.success('Address extracted from clipboard');
    } catch (err) {
      toast.error('Clipboard access denied or empty');
    }
  };

  const handlePrint = async () => {
    try {
      if (!initialLabel?.id) { await saveLabel(label); }
      const cleanup = () => {
        window.removeEventListener('afterprint', cleanup);
        onFinish();
      };
      window.addEventListener('afterprint', cleanup);
      window.print();
    } catch (e) {
      toast.error('Failed to print');
    }
  };

  const handleDownload = async () => {
    try {
      toast.loading('Preparing print dialog for PDF...', { id: 'pdf' });
      await handlePrint();
      toast.success('Done', { id: 'pdf' });
    } catch(e) {
      toast.error('Failed', { id: 'pdf' });
    }
  };

  const handleShare = async () => {
    try {
      toast.loading('Preparing print dialog for PDF...', { id: 'pdf' });
      await handlePrint();
      toast.success('Done', { id: 'pdf' });
    } catch(e) {
      toast.error('Failed', { id: 'pdf' });
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 h-full relative overflow-x-hidden print:hidden mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 bg-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <button 
          onClick={step > 1 ? () => setStep(step - 1) : onFinish}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg">
          {step === 1 ? 'Recipient Details' : step === 2 ? 'Shipment & Product Details' : 'Preview Output'}
        </span>
        <div className="w-10" /> {/* Balancer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 print:hidden">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
            {/* Quick Actions */}
            <button 
              onClick={handlePaste}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 p-4 rounded-xl font-semibold active:scale-[0.98] transition-all border border-blue-100 dark:border-blue-800/50"
            >
              <ClipboardPaste className="w-5 h-5" />
              Smart Paste from Clipboard
            </button>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Customer Name <span className="text-red-500">*</span></label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[48px] focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[15px] transition-all"
                  placeholder="John Doe"
                  value={label.recipient.name}
                  onChange={e => setLabel({...label, recipient: {...label.recipient, name: e.target.value}})}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[48px] focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[15px] transition-all"
                  placeholder="0987654321"
                  value={label.recipient.phone}
                  onChange={e => setLabel({...label, recipient: {...label.recipient, phone: e.target.value}})}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Full Address <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none text-[15px] leading-relaxed transition-all"
                  placeholder="Flat No, Street, Landmark, City, State, Pincode"
                  rows={4}
                  value={label.recipient.address}
                  onChange={e => setLabel({...label, recipient: {...label.recipient, address: e.target.value}})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Order ID <span className="text-red-500">*</span></label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[48px] focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[15px] font-mono transition-all"
                  placeholder="Enter Order ID"
                  value={label.orderId || ''}
                  onChange={e => setLabel({...label, orderId: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Product Details <span className="text-slate-400 normal-case tracking-normal font-medium">(Optional)</span></label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none text-[15px] transition-all"
                  placeholder="e.g. 2x Cotton T-Shirts, Size M"
                  rows={4}
                  value={label.productDetails}
                  onChange={e => setLabel({...label, productDetails: e.target.value})}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">These details will be printed on the bottom of the label for easy picking.</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center max-w-2xl mx-auto">
            
            <div className="flex flex-col items-center mb-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Select Output Size</p>
              {/* Page Size Selector */}
              <div className="bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl inline-flex whitespace-nowrap shadow-inner">
                <button
                  onClick={() => handlePageSizeChange('A5')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${pageSize === 'A5' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  A5 Size
                </button>
                <button
                  onClick={() => handlePageSizeChange('A6')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${pageSize === 'A6' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  A6 Size
                </button>
              </div>
            </div>
            
            {/* Visual Screen Preview */}
            <div 
              className="w-full relative flex justify-center py-6 overflow-hidden bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800"
            >
              <div 
                className="bg-white shadow-2xl shadow-slate-300/50 dark:shadow-black/50 relative overflow-hidden transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 print-paper"
                style={{
                  maxWidth: pageSize === 'A5' ? '320px' : '280px',
                  aspectRatio: pageSize === 'A5' ? '1748/2480' : '1240/1748'
                }}
              >
                <div style={{
                  transform: `scale(${pageSize === 'A5' ? (320 / 560) : (280 / 397)})`,
                  transformOrigin: 'top left',
                  width: pageSize === 'A5' ? '560px' : '397px',
                  height: pageSize === 'A5' ? '794px' : '560px'
                }}>
                  <PrintableLabel sender={sender} label={label} pageSize={pageSize} id="preview-label" />
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-slate-500 mt-2 max-w-[280px]">
              Select paper size before exporting to ensure correct visual scaling.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe print:hidden z-20">
        <div className="max-w-3xl mx-auto w-full">
        {step < 3 ? (
          <button 
            onClick={() => {
              if (step === 1) {
                if (!label.recipient.name || !label.recipient.address) {
                  toast.error('Please fill Name and Address');
                  return;
                }
              } else if (step === 2) {
                if (!label.orderId || !label.orderId.trim()) {
                  toast.error('Order ID is required.');
                  return;
                }
              }
              setStep(s => s + 1);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            Continue to Next Step
            <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
            <button 
              onClick={handlePrint}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <Printer className="w-6 h-6" />
              Print Label
            </button>
            <div className="flex gap-3 flex-1">
              <button 
                onClick={handleDownload}
                className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-4 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 p-4 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm border border-blue-200 dark:border-blue-800/50"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    {typeof document !== 'undefined' && createPortal(
      <div id="print-root">
        <PrintableLabel sender={sender} label={label} pageSize={pageSize} />
      </div>,
      document.body
    )}
    </>
  );
}
