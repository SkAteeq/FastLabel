import React from 'react';
import { SenderProfile, LabelRecord } from '../types';

interface PrintableLabelProps {
  sender?: SenderProfile;
  label: LabelRecord;
}

export function PrintableLabel({ sender, label }: PrintableLabelProps) {
  if (!sender) return null;

  return (
    <div id="printable-label" className="bg-white text-black font-sans w-[4in] h-[6in] border-none hidden print:flex flex-col box-border overflow-hidden">
      
      {/* Row 1: Top Row (FROM ADDRESS with LOGO) – 30% height */}
      <div className="flex flex-row w-full h-[30%] border-b-2 border-black box-border p-4 overflow-hidden">
        <div className={`flex flex-col h-full justify-between ${sender.logo ? 'w-[75%]' : 'w-full'} pr-4 text-left`}>
          <div className="text-lg font-bold uppercase leading-tight">{sender.businessName}</div>
          <div className="text-sm whitespace-pre-line leading-relaxed flex-1 flex flex-col justify-center py-2">{sender.address}</div>
          {sender.phone ? <div className="text-sm font-medium">Ph: {sender.phone}</div> : <div />}
        </div>
        
        {sender.logo && (
          <div className="w-[25%] h-full flex justify-end items-center">
            <img src={sender.logo} alt="Logo" className="max-w-full max-h-full object-contain grayscale" />
          </div>
        )}
      </div>

      {/* Row 2: Middle Row (SHIP TO – PRIMARY FOCUS) – 50% height */}
      <div className="w-full h-[50%] border-b-2 border-black box-border p-4 flex flex-col justify-start overflow-hidden text-left">
        <div className="text-xs font-medium uppercase tracking-widest text-[#333333] mb-2">Ship To:</div>
        <div className="text-2xl font-bold uppercase leading-snug mb-2 tracking-wide break-words">
          {label.recipient.name}
        </div>
        {label.recipient.phone && (
          <div className="text-lg font-semibold mb-3">
            Tel: {label.recipient.phone}
          </div>
        )}
        <div className="text-base font-normal whitespace-pre-line leading-relaxed max-w-full break-words">
          {label.recipient.address}
        </div>
      </div>

      {/* Row 3: Bottom Row (PRODUCT DETAILS) – 20% height */}
      <div className="w-full h-[20%] box-border p-4 flex flex-col justify-start overflow-hidden text-left">
        <div className="text-xs font-medium uppercase tracking-widest text-[#333333] mb-1">Product Details:</div>
        {label.productDetails ? (
          <div className="text-sm font-normal whitespace-pre-line break-words leading-relaxed">
            {label.productDetails}
          </div>
        ) : (
          <div className="text-sm italic text-[#666666]">No details provided</div>
        )}
      </div>
      
    </div>
  );
}
