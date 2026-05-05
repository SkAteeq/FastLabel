import React, { useState, useEffect } from 'react';
import { ChevronLeft, ClipboardPaste, Printer, Search, PlusCircle, CheckCircle2, Share2 } from 'lucide-react';
import { SenderProfile, LabelRecord } from '../types';
import { saveLabel } from '../db';
import { PrintableLabel } from '../components/PrintableLabel';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';

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
    // Save to history before print
    if (!initialLabel?.id) {
      await saveLabel(label);
    }
    toast.success('Preparing print...');
    window.print();
    onFinish();
  };

  const generatePDFBlob = async () => {
    const el = document.getElementById('printable-label');
    if (!el) throw new Error('Label not found');
    
    // Check original state
    const originalStyle = el.style.cssText;
    const originalClassName = el.className;
    
    // Temporarily expose the label purely for capturing
    el.className = "bg-white text-black font-sans box-border overflow-hidden absolute top-0 left-0 z-50 flex flex-col";
    el.style.width = '384px'; // 4 inches at 96 dpi
    el.style.height = '576px'; // 6 inches at 96 dpi

    // Try using dom-to-image to bypass oklch parsing errors inside html2canvas
    const imgData = await domtoimage.toPng(el, {
      width: 384 * 3, // 4 inches at 96 dpi * 3 for higher quality
      height: 576 * 3,
      style: {
        transform: 'scale(3)',
        transformOrigin: 'top left',
        width: '384px',
        height: '576px'
      }
    });

    // Restore
    el.className = originalClassName;
    el.style.cssText = originalStyle;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [4, 6]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 4, 6);
    return pdf.output('blob');
  };

  const handleShare = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      
      if (!initialLabel?.id) {
        await saveLabel(label);
      }

      const blob = await generatePDFBlob();
      const file = new File([blob], `Shipping_Label_${label.recipient.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Shipping Label',
          text: 'Here is the shipping label.'
        });
        toast.success('Ready to share!', { id: 'pdf' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded PDF!', { id: 'pdf' });
      }
      onFinish();
    } catch (e) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-full">
      <PrintableLabel sender={sender} label={label} />
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <button 
          onClick={step > 1 ? () => setStep(step - 1) : onFinish}
          className="p-2 -ml-2 text-slate-500 active:bg-slate-100 dark:active:bg-slate-800 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-lg">
          {step === 1 ? 'Recipient Details' : step === 2 ? 'Product Details' : 'Preview & Print'}
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
            
            <p className="text-sm text-slate-500">Preview (4x6 thermal label)</p>
            
            {/* Visual Screen Preview (Not the actual print one) */}
            <div className="w-full max-w-[300px] aspect-[2/3] bg-white text-black shadow-xl border border-slate-200 rounded-sm flex flex-col overflow-hidden relative">
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

            <p className="text-xs text-center text-slate-400 mt-4 max-w-[250px]">
              Tip: Ensure your default printer is set to a thermal 4x6 or A4 in the system print dialog.
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
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-xl font-bold text-base active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-sm border border-indigo-200"
            >
              <Share2 className="w-5 h-5" />
              Share PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex-[1.5] bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white p-4 rounded-xl font-bold text-base active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-lg"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
