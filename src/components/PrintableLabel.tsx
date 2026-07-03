import React, { useEffect } from 'react';
import { SenderProfile, LabelRecord } from '../types';
import { MapPin, Phone, Home, ClipboardList, Truck, Building2, Package, QrCode, Star, Umbrella, ArrowUpFromLine, Send, Mail } from 'lucide-react';

interface PrintableLabelProps {
  sender?: SenderProfile;
  label: LabelRecord;
  pageSize?: 'A6' | 'A5';
  id?: string;
}

export function PrintableLabel({ sender, label, pageSize = 'A6', id = "printable-label" }: PrintableLabelProps) {
  if (!sender) return null;

  const isA6 = pageSize === 'A6';
  
  // Base dimensions strictly in px mapping to CSS units (96dpi standard)
  const widthPx = isA6 ? '397px' : '560px';
  const minHeightPx = isA6 ? '560px' : '794px';
  const paddingPx = isA6 ? '12px' : '16px';
  const gapPx = isA6 ? '12px' : '16px';

  useEffect(() => {
    // Dynamically inject the @page rule to force printer size
    const styleId = 'print-page-size';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${pageSize};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
  }, [pageSize]);

  // Extract pincode (last 5-6 digits from address)
  const pincodeMatch = label.recipient.address.match(/\b\d{5,6}\b(?!.*\b\d{5,6}\b)/);
  const pincode = pincodeMatch ? pincodeMatch[0] : '';
  
  // Order ID
  const orderId = label.orderId || (label.id ? `ORD-${String(label.id).padStart(6, '0')}` : `ORD-${String(Math.floor((label.timestamp || Date.now()) / 1000)).slice(-6)}`);
  
  // Shipping Courier Partner
  const courier = label.courierPartner || 'Express Ship';
  const courierFontSize = courier.length > 15 ? (isA6 ? '11px' : '13px') : (courier.length > 10 ? (isA6 ? '13px' : '16px') : (isA6 ? '16px' : '20px'));

  return (
    <div 
      id={id} 
      style={{ 
        width: widthPx,
        minHeight: minHeightPx,
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
        padding: paddingPx,
        display: 'flex',
        flexDirection: 'column',
        gap: gapPx,
        overflow: 'hidden'
      }}
    >
      {/* SECTION 1: SHIP TO */}
      <div style={{
        border: '3px solid #0B192C',
        borderRadius: isA6 ? '12px' : '16px',
        padding: isA6 ? '12px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            backgroundColor: '#0B192C',
            color: '#fff',
            padding: isA6 ? '6px 12px' : '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={isA6 ? 16 : 20} />
            <span style={{ fontWeight: 'bold', fontSize: isA6 ? '16px' : '20px', letterSpacing: '1px' }}>SHIP TO :</span>
          </div>
          
          <div style={{
            border: '2px solid #0B192C',
            borderRadius: '8px',
            padding: isA6 ? '4px 8px' : '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ClipboardList size={isA6 ? 16 : 20} color="#0B192C" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: isA6 ? '10px' : '12px', fontWeight: 'bold' }}>ORDER ID :</span>
              <span style={{ fontSize: isA6 ? '12px' : '14px', fontWeight: 'bold', color: '#1e3a8a' }}>{orderId}</span>
            </div>
          </div>
        </div>

        {/* Body Row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: isA6 ? '24px' : '32px', fontWeight: '900', textTransform: 'uppercase', color: '#0B192C', lineHeight: 1.1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {label.recipient.name}
            </div>
            
            {label.recipient.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: isA6 ? '14px' : '16px', fontWeight: 'bold' }}>
                <Phone size={isA6 ? 14 : 16} />
                {label.recipient.phone}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <Home size={isA6 ? 16 : 20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: isA6 ? '12px' : '14px', fontWeight: '600', whiteSpace: 'pre-wrap', lineHeight: 1.4, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {label.recipient.address}
              </div>
            </div>

            {pincode && (
              <div style={{ marginTop: '8px', border: '2px solid #0B192C', borderRadius: '6px', width: 'fit-content', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#0B192C', color: '#fff', fontSize: isA6 ? '10px' : '12px', fontWeight: 'bold', textAlign: 'center', padding: '2px 8px' }}>
                  PINCODE
                </div>
                <div style={{ padding: '4px 8px', fontSize: isA6 ? '16px' : '20px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
                  {pincode}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: isA6 ? '100px' : '140px', flexShrink: 0 }}>
            <div style={{ border: '2px solid #0B192C', borderRadius: '8px', overflow: 'hidden', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#0B192C', color: '#fff', fontSize: isA6 ? '10px' : '12px', fontWeight: 'bold', padding: '4px' }}>
                DELIVERY TYPE
              </div>
              <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Truck size={isA6 ? 14 : 18} color="#0B192C" />
                <span style={{ fontSize: isA6 ? '12px' : '14px', fontWeight: 'bold', color: '#1e3a8a' }}>STANDARD</span>
              </div>
            </div>
            <div style={{ border: '2px solid #0B192C', borderRadius: '8px', overflow: 'hidden', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: '#0B192C', color: '#fff', fontSize: isA6 ? '10px' : '12px', fontWeight: 'bold', padding: '4px' }}>
                COURIER
              </div>
              <div style={{ padding: '8px', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: courierFontSize, fontWeight: '900', color: '#dc2626', lineHeight: 1.1, textTransform: 'uppercase', wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', display: 'inline-block' }}>{courier}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SHIP FROM */}
      <div style={{
        border: '3px solid #0B192C',
        borderRadius: isA6 ? '12px' : '16px',
        padding: isA6 ? '12px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: '#0B192C',
          color: '#fff',
          padding: isA6 ? '6px 12px' : '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: 'fit-content'
        }}>
          <Send size={isA6 ? 16 : 20} />
          <span style={{ fontWeight: 'bold', fontSize: isA6 ? '14px' : '18px', letterSpacing: '1px' }}>SHIP FROM :</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Building2 size={isA6 ? 16 : 20} style={{ flexShrink: 0, marginTop: '2px', color: '#0B192C' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ fontSize: isA6 ? '14px' : '16px', fontWeight: 'bold', color: '#1e3a8a', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{sender.businessName}</span>
                 <span style={{ fontSize: isA6 ? '12px' : '14px', whiteSpace: 'pre-wrap', lineHeight: 1.4, wordWrap: 'break-word', overflowWrap: 'break-word' }}>{sender.address}</span>
              </div>
            </div>
            
            {sender.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Phone size={isA6 ? 14 : 16} style={{ color: '#0B192C' }} />
                <span style={{ fontSize: isA6 ? '12px' : '14px', fontWeight: '600' }}>{sender.phone}</span>
              </div>
            )}

            {sender.address.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <Mail size={isA6 ? 14 : 16} style={{ color: '#0B192C' }} />
                <span style={{ fontSize: isA6 ? '12px' : '14px', fontWeight: '600' }}>{sender.address.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)![0]}</span>
              </div>
            )}
          </div>

          {sender.logo && (
            <div style={{ width: isA6 ? '80px' : '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #CBD5E1', paddingLeft: '16px', flexShrink: 0 }}>
              <img src={sender.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: isA6 ? '60px' : '80px', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: PRODUCT DETAILS */}
      <div style={{
        border: '3px solid #0B192C',
        borderRadius: isA6 ? '12px' : '16px',
        padding: isA6 ? '12px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1
      }}>
        <div style={{
          backgroundColor: '#0B192C',
          color: '#fff',
          padding: isA6 ? '6px 12px' : '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: 'fit-content'
        }}>
          <Package size={isA6 ? 16 : 20} />
          <span style={{ fontWeight: 'bold', fontSize: isA6 ? '14px' : '18px', letterSpacing: '1px' }}>PRODUCT DETAILS</span>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #0B192C', paddingBottom: '4px', marginTop: '4px' }}>
          <div style={{ flex: 1, fontSize: isA6 ? '10px' : '12px', fontWeight: 'bold', textAlign: 'center' }}>ITEM NAME</div>
          <div style={{ width: isA6 ? '40px' : '60px', fontSize: isA6 ? '10px' : '12px', fontWeight: 'bold', textAlign: 'center', borderLeft: '1px dashed #0B192C' }}>QTY</div>
        </div>
        
        <div style={{ display: 'flex', borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px', flex: 1 }}>
          <div style={{ flex: 1, fontSize: isA6 ? '12px' : '14px', padding: '4px 8px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {label.productDetails || 'No details provided'}
          </div>
          <div style={{ width: isA6 ? '40px' : '60px', fontSize: isA6 ? '12px' : '14px', padding: '4px', textAlign: 'center', borderLeft: '1px dashed #0B192C', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {label.productDetails ? '1' : '0'}
          </div>
        </div>

        {/* Footer info area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ border: '2px solid #0B192C', padding: '4px', borderRadius: '4px' }}>
              <QrCode size={isA6 ? 32 : 48} color="#0B192C" />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'center', flex: 1, justifyContent: 'center', padding: '0 8px' }}>
            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', padding: '6px', border: '1px solid #cbd5e1' }}>
              <Star size={isA6 ? 14 : 20} style={{ color: '#0B192C' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: isA6 ? '10px' : '14px', fontWeight: 'bold' }}>Thank you for shopping!</span>
              <span style={{ fontSize: isA6 ? '8px' : '12px', color: '#475569' }}>We hope you love your purchase.</span>
            </div>
          </div>

          <div style={{ border: '2px solid #0B192C', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#0B192C', color: '#fff', fontSize: isA6 ? '8px' : '10px', fontWeight: 'bold', textAlign: 'center', padding: '2px 4px' }}>
              HANDLE WITH CARE
            </div>
            <div style={{ padding: '4px 8px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
               <Package size={isA6 ? 14 : 18} color="#0B192C" />
               <Umbrella size={isA6 ? 14 : 18} color="#0B192C" />
               <ArrowUpFromLine size={isA6 ? 14 : 18} color="#0B192C" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
