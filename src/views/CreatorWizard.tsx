import React, { useState, useEffect } from 'react';
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
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface CreatorWizardProps {
  sender: SenderProfile;
  initialLabel?: LabelRecord;
  initialStep?: number;
  onFinish: () => void;
}

export function CreatorWizard({ sender, initialLabel, initialStep = 1, onFinish }: CreatorWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [label, setLabel] = useState<LabelRecord>(initialLabel || {
    recipient: { name: '', phone: '', address: '' },
    productDetails: '',
    timestamp: Date.now()
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
    setPageSize(newSize);
    try {
      localStorage.setItem('fastlabel_pagesize', newSize);
    } catch(e){}
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

  const getLabelHtml = () => {
    const el = document.getElementById('printable-label');
    if (!el) return '';
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: ${pageSize}; margin: 0; }
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    #printable-label { display: block !important; width: 100%; height: 100%; }
  </style>
</head>
<body>
  ${el.outerHTML}
</body>
</html>`;
  };

  const handlePrint = async () => {
    try {
      if (!initialLabel?.id) { await saveLabel(label); }
      if (typeof window !== 'undefined' && (window as any).AndroidBridge?.printHtml) {
        (window as any).AndroidBridge.printHtml(getLabelHtml(), pageSize);
        onFinish();
      } else {
        setTimeout(() => {
          window.print();
          onFinish();
        }, 100);
      }
    } catch (e) {}
  };

  const handleDownload = async () => {
    try {
      if (!initialLabel?.id) { await saveLabel(label); }
      if (typeof window !== 'undefined' && (window as any).AndroidBridge?.downloadHtml) {
        (window as any).AndroidBridge.downloadHtml(getLabelHtml(), pageSize);
        toast.success('Saving PDF...');
        onFinish();
      } else {
        toast.loading('Generating PDF...', { id: 'pdf' });
        const el = document.getElementById('printable-label');
        if (el) {
          const clone = el.cloneNode(true) as HTMLElement;
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '0';
          container.style.top = '0';
          container.style.zIndex = '-9999';
          container.style.opacity = '0';
          container.style.pointerEvents = 'none';
          
          container.appendChild(clone);
          document.body.appendChild(container);

          const isA6 = pageSize === 'A6';
          const opt = {
            margin: 0,
            filename: `FastLabel_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 1, useCORS: true, logging: false },
            jsPDF: { unit: 'mm' as const, format: isA6 ? 'a6' : 'a5', orientation: 'portrait' as const }
          };
          
          await html2pdf().set(opt).from(clone).save();
          document.body.removeChild(container);
          
          toast.success('Downloaded PDF!', { id: 'pdf' });
        } else {
          toast.error('Failed to locate PDF element', { id: 'pdf' });
        }
        onFinish();
      }
    } catch(e) {
      toast.error('Failed to download PDF', { id: 'pdf' });
      console.error(e);
    }
  };

  const handleShare = async () => {
    try {
      if (!initialLabel?.id) { await saveLabel(label); }
      if (typeof window !== 'undefined' && (window as any).AndroidBridge?.shareHtml) {
        (window as any).AndroidBridge.shareHtml(getLabelHtml(), pageSize);
        toast.success('Preparing to share...');
        onFinish();
      } else {
        toast.loading('Generating PDF...', { id: 'pdf' });
        const el = document.getElementById('printable-label');
        if (el) {
          const clone = el.cloneNode(true) as HTMLElement;
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '0';
          container.style.top = '0';
          container.style.zIndex = '-9999';
          container.style.opacity = '0';
          container.style.pointerEvents = 'none';
          
          container.appendChild(clone);
          document.body.appendChild(container);

          const isA6 = pageSize === 'A6';
          const opt = {
            margin: 0,
            filename: `FastLabel_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 1, useCORS: true, logging: false },
            jsPDF: { unit: 'mm' as const, format: isA6 ? 'a6' : 'a5', orientation: 'portrait' as const }
          };
          
          const pdfBlob = await html2pdf().set(opt).from(clone).output('blob');
          document.body.removeChild(container);
          
          const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Shipping Label',
              text: 'Here is the shipping label.'
            });
            toast.success('Ready to share!', { id: 'pdf' });
          } else {
            // Fallback to download
            toast.loading('Sharing not supported, downloading instead...', { id: 'pdf' });
            
            const containerDL = document.createElement('div');
            containerDL.style.position = 'absolute';
            containerDL.style.left = '0';
            containerDL.style.top = '0';
            containerDL.style.zIndex = '-9999';
            containerDL.style.opacity = '0';
            containerDL.style.pointerEvents = 'none';
            containerDL.appendChild(clone);
            document.body.appendChild(containerDL);
            
            await html2pdf().set(opt).from(clone).save();
            document.body.removeChild(containerDL);
            
            toast.success('Downloaded PDF instead!', { id: 'pdf' });
          }
        } else {
          toast.error('Failed to locate PDF element', { id: 'pdf' });
        }
        onFinish();
      }
    } catch(e) {
      toast.error('Failed to share PDF', { id: 'pdf' });
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-full relative overflow-x-hidden">
      <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden print:static print:left-auto print:top-auto print:overflow-visible">
        <PrintableLabel sender={sender} label={label} pageSize={pageSize} />
      </div>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <button 
          onClick={step > 1 ? () => setStep(step - 1) : onFinish}
          className="p-2 -ml-2 text-slate-500 active:bg-slate-100 dark:active:bg-slate-800 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-lg">
          {step === 1 ? 'Recipient Details' : step === 2 ? 'Product Details' : 'Preview Output'}
        </span>
        <div className="w-10" /> {/* Balancer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 print:hidden">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Quick Actions */}
            <button 
              onClick={handlePaste}
              className="w-full flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-4 rounded-xl font-medium active:scale-95 transition-transform border border-indigo-100 dark:border-indigo-800/50"
            >
              <ClipboardPaste className="w-5 h-5" />
              Smart Paste from Clipboard
            </button>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[48px] focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                  placeholder="John Doe"
                  value={label.recipient.name}
                  onChange={e => setLabel({...label, recipient: {...label.recipient, name: e.target.value}})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input 
                  type="tel"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[48px] focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                  placeholder="0987654321"
                  value={label.recipient.phone}
                  onChange={e => setLabel({...label, recipient: {...label.recipient, phone: e.target.value}})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Address *</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-lg leading-relaxed"
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
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-500">Product Details (Optional)</label>
                <textarea 
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-lg"
                  placeholder="e.g. 2x Cotton T-Shirts, Size M"
                  rows={4}
                  value={label.productDetails}
                  onChange={e => setLabel({...label, productDetails: e.target.value})}
                />
                <p className="text-xs text-slate-400 mt-2">These details will be printed on the bottom of the label for easy picking.</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center">
            
            <p className="text-sm text-slate-500 mb-2">Select Output Size:</p>
            
            {/* Page Size Selector */}
            <div className="w-full flex justify-center mb-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex whitespace-nowrap">
                <button
                  onClick={() => handlePageSizeChange('A5')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pageSize === 'A5' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  A5
                </button>
                <button
                  onClick={() => handlePageSizeChange('A6')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pageSize === 'A6' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  A6
                </button>
              </div>
            </div>
            
            {/* Visual Screen Preview (Not the actual print one) */}
            <div 
              className="w-full bg-white text-black shadow-xl border border-slate-200 rounded-sm flex flex-col overflow-hidden relative"
              style={{
                maxWidth: pageSize === 'A5' ? '300px' : '280px',
                aspectRatio: pageSize === 'A5' ? '1748/2480' : '1240/1748'
              }}
            >
              {/* Top Row - 30% */}
              <div className="flex flex-row w-full h-[30%] border-b-2 border-black box-border p-3 overflow-hidden">
                <div className={`flex flex-col h-full justify-between ${sender.logo ? 'w-[75%]' : 'w-full'} pr-2 text-left`}>
                  <div className="font-bold text-xs uppercase leading-tight">{sender.businessName}</div>
                  <div className="text-[10px] whitespace-pre-line leading-relaxed flex-1 flex flex-col justify-center py-1">{sender.address}</div>
                  {sender.phone ? <div className="text-[10px] font-medium">Ph: {sender.phone}</div> : <div />}
                </div>
                {sender.logo && (
                  <div className="w-[25%] h-full flex justify-end items-center">
                    <img src={sender.logo} className="max-w-full max-h-full object-contain grayscale" alt="Logo" />
                  </div>
                )}
              </div>
              
              {/* Middle Row - 50% */}
              <div className="w-full h-[50%] border-b-2 border-black box-border p-3 flex flex-col justify-start overflow-hidden text-left">
                <div className="text-[10px] font-medium uppercase tracking-widest text-[#333333] mb-1.5">Ship To:</div>
                <div className="font-bold text-xl leading-snug uppercase mb-1.5 break-words">{label.recipient.name}</div>
                {label.recipient.phone && <div className="text-sm font-semibold mb-2">Tel: {label.recipient.phone}</div>}
                <div className="text-xs font-normal whitespace-pre-line leading-relaxed break-words">{label.recipient.address}</div>
              </div>

              {/* Bottom Row - 20% */}
              <div className="w-full h-[20%] box-border p-3 flex flex-col justify-start overflow-hidden text-left">
                <div className="text-[10px] font-medium uppercase tracking-widest text-[#333333] mb-1">Product Details:</div>
                {label.productDetails ? (
                  <div className="text-xs font-normal whitespace-pre-line break-words leading-relaxed">
                    {label.productDetails}
                  </div>
                ) : (
                  <div className="text-xs italic text-[#666666]">No details provided</div>
                )}
              </div>
            </div>

            <p className="text-xs text-center text-slate-500 mt-4 max-w-[280px]">
              Select paper size before exporting to ensure correct visual scaling.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe print:hidden">
        {step < 3 ? (
          <button 
            onClick={() => {
              if (step === 1 && (!label.recipient.name || !label.recipient.address)) {
                toast.error('Please fill Name and Address');
                return;
              }
              setStep(s => s + 1);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-lg"
          >
            Continue
            <CheckCircle2 className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handlePrint}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-lg"
            >
              <Printer className="w-6 h-6" />
              Print Label
            </button>
            <div className="flex gap-3">
              <button 
                onClick={handleDownload}
                className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-xl font-bold text-sm active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button 
                onClick={handleShare}
                className="flex-[1] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-3 rounded-xl font-bold text-sm active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-sm border border-indigo-200"
              >
                <Share2 className="w-5 h-5" />
                Share PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
