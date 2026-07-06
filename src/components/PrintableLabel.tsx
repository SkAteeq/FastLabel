import React, { useEffect } from 'react';
import { SenderProfile, LabelRecord } from '../types';
import { MapPin, Phone, Home, ClipboardList, Building2, Package, QrCode, Star, Umbrella, ArrowUpFromLine, Send, Mail } from 'lucide-react';

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
  const paddingPx = isA6 ? '12px' : '18px';
  const gapPx = isA6 ? '10px' : '14px';

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
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: high-quality;
        }
      }
    `;
  }, [pageSize]);

  // Extract pincode (last 5-6 digits from address)
  const pincodeMatch = label.recipient.address.match(/\b\d{5,6}\b(?!.*\b\d{5,6}\b)/);
  const pincode = pincodeMatch ? pincodeMatch[0] : '';
  
  // Order ID
  const orderId = label.orderId || (label.id ? `ORD-${String(label.id).padStart(6, '0')}` : `ORD-${String(Math.floor((label.timestamp || Date.now()) / 1000)).slice(-6)}`);

  // Dynamic scaling based on paper size and text length
  const addressText = label.recipient.address || '';
  const nameText = label.recipient.name || '';
  const addressLen = addressText.length;
  const nameLen = nameText.length;
  
  // Font sizes for Ship To (Recipient)
  let recipientNameSize = isA6 ? '24px' : '32px';
  if (nameLen > 25) {
    recipientNameSize = isA6 ? '18px' : '24px';
  } else if (nameLen < 12) {
    recipientNameSize = isA6 ? '28px' : '38px';
  }

  let recipientAddressSize = isA6 ? '14px' : '18px';
  if (addressLen > 100) {
    recipientAddressSize = isA6 ? '11px' : '14px';
  } else if (addressLen < 40) {
    recipientAddressSize = isA6 ? '16px' : '22px';
  }

  // Font sizes for Ship From (Sender)
  const senderAddressText = sender.address || '';
  const senderNameText = sender.businessName || '';
  const senderAddressLen = senderAddressText.length;
  const senderNameLen = senderNameText.length;

  let senderNameSize = isA6 ? '13px' : '17px';
  if (senderNameLen > 25) {
    senderNameSize = isA6 ? '11px' : '13px';
  }

  let senderAddressSize = isA6 ? '11px' : '14px';
  if (senderAddressLen > 100) {
    senderAddressSize = isA6 ? '9px' : '11px';
  } else if (senderAddressLen < 40) {
    senderAddressSize = isA6 ? '13px' : '16px';
  }

  return (
    <div 
      id={id} 
      style={{ 
        width: widthPx,
        height: minHeightPx,
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
        padding: paddingPx,
        display: 'flex',
        flexDirection: 'column',
        gap: gapPx,
        overflow: 'hidden',
        border: '3px solid #0B192C'
      }}
    >
      {/* SECTION 1: SHIP TO (45% Height) */}
      <div style={{
        flex: '45 45 0%',
        minHeight: 0,
        width: '100%',
        border: '2px solid #0B192C',
        borderRadius: isA6 ? '6px' : '8px',
        padding: isA6 ? '10px 14px' : '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: isA6 ? '6px' : '10px',
        boxSizing: 'border-box'
      }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            backgroundColor: '#0B192C',
            color: '#fff',
            padding: isA6 ? '4px 10px' : '6px 14px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <MapPin size={isA6 ? 12 : 15} />
            <span style={{ fontWeight: 'bold', fontSize: isA6 ? '12px' : '15px', letterSpacing: '0.5px' }}>SHIP TO</span>
          </div>
          
          <div style={{
            border: '2px solid #0B192C',
            borderRadius: '4px',
            padding: isA6 ? '3px 8px' : '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ClipboardList size={isA6 ? 12 : 15} color="#0B192C" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: isA6 ? '8px' : '9px', fontWeight: 'bold', lineHeight: 1 }}>ORDER ID :</span>
              <span style={{ fontSize: isA6 ? '11px' : '13px', fontWeight: 'bold', color: '#1e3a8a' }}>{orderId}</span>
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isA6 ? '6px' : '10px', flex: 1, justifyContent: 'center' }}>
          <div style={{ fontSize: recipientNameSize, fontWeight: '900', textTransform: 'uppercase', color: '#0B192C', lineHeight: 1.1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {label.recipient.name}
          </div>
          
          {label.recipient.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: isA6 ? '12px' : '14px', fontWeight: 'bold', color: '#334155' }}>
              <Phone size={isA6 ? 11 : 13} />
              {label.recipient.phone}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <Home size={isA6 ? 13 : 16} style={{ flexShrink: 0, marginTop: '2px', color: '#475569' }} />
            <div style={{ fontSize: recipientAddressSize, fontWeight: '700', whiteSpace: 'pre-wrap', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'break-word', color: '#000000' }}>
              {label.recipient.address}
            </div>
          </div>

          {pincode && (
            <div style={{ border: '2px solid #0B192C', borderRadius: '4px', display: 'flex', alignItems: 'stretch', width: 'fit-content', overflow: 'hidden', alignSelf: 'flex-start', marginTop: isA6 ? '2px' : '4px' }}>
              <div style={{ backgroundColor: '#0B192C', color: '#fff', fontSize: isA6 ? '9px' : '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', padding: '0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                PINCODE
              </div>
              <div style={{ padding: isA6 ? '2px 10px' : '4px 16px', fontSize: isA6 ? '14px' : '18px', fontWeight: '900', color: '#000000', letterSpacing: '1px', backgroundColor: '#f8fafc' }}>
                {pincode}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: SHIP FROM (35% Height) */}
      <div style={{
        flex: '35 35 0%',
        minHeight: 0,
        width: '100%',
        border: '2px solid #0B192C',
        borderRadius: isA6 ? '6px' : '8px',
        padding: isA6 ? '10px 14px' : '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: isA6 ? '6px' : '10px',
        boxSizing: 'border-box'
      }}>
        {/* Header Title */}
        <div style={{
          backgroundColor: '#0B192C',
          color: '#fff',
          padding: isA6 ? '3px 8px' : '4px 12px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: 'fit-content'
        }}>
          <Send size={isA6 ? 11 : 13} />
          <span style={{ fontWeight: 'bold', fontSize: isA6 ? '11px' : '13px', letterSpacing: '0.5px' }}>FROM</span>
        </div>

        {/* Sender Details */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'stretch' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <Building2 size={isA6 ? 12 : 14} style={{ flexShrink: 0, marginTop: '2px', color: '#0B192C' }} />
              <span style={{ fontSize: senderNameSize, fontWeight: 'bold', color: '#1e3a8a', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.15 }}>
                {sender.businessName}
              </span>
            </div>
            
            <div style={{ fontSize: senderAddressSize, whiteSpace: 'pre-wrap', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'break-word', color: '#334155' }}>
              {sender.address}
            </div>
            
            {sender.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Phone size={isA6 ? 10 : 12} style={{ color: '#0B192C' }} />
                <span style={{ fontSize: isA6 ? '10px' : '12px', fontWeight: '600', color: '#475569' }}>{sender.phone}</span>
              </div>
            )}

            {sender.address.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <Mail size={isA6 ? 10 : 12} style={{ color: '#0B192C' }} />
                <span style={{ fontSize: isA6 ? '9px' : '11px', fontWeight: '600', color: '#475569', wordBreak: 'break-all' }}>
                  {sender.address.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)![0]}
                </span>
              </div>
            )}
          </div>

          {sender.logo && (
            <div style={{ 
              width: isA6 ? '60px' : '85px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderLeft: '1.5px solid #CBD5E1', 
              paddingLeft: '12px', 
              flexShrink: 0 
            }}>
              <img src={sender.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: isA6 ? '45px' : '65px', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: PRODUCT DETAILS (20% Height) */}
      <div style={{
        flex: '20 20 0%',
        minHeight: 0,
        width: '100%',
        border: '2px solid #0B192C',
        borderRadius: isA6 ? '6px' : '8px',
        padding: isA6 ? '8px 10px' : '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: isA6 ? '6px' : '10px',
        boxSizing: 'border-box'
      }}>
        {/* Header Title */}
        <div style={{
          backgroundColor: '#0B192C',
          color: '#fff',
          padding: isA6 ? '3px 8px' : '4px 12px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: 'fit-content'
        }}>
          <Package size={isA6 ? 12 : 14} />
          <span style={{ fontWeight: 'bold', fontSize: isA6 ? '11px' : '13px', letterSpacing: '0.5px' }}>PRODUCT DETAILS</span>
        </div>

        {/* Content Table (Flexible to fill height) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1, 
          border: '2px solid #0B192C', 
          borderRadius: '4px', 
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{ display: 'flex', backgroundColor: '#0B192C', color: '#fff' }}>
            <div style={{ flex: 1, fontSize: isA6 ? '10px' : '11px', fontWeight: 'bold', padding: isA6 ? '4px 8px' : '6px 12px' }}>
              ITEM NAME & DESCRIPTION
            </div>
            <div style={{ 
              width: isA6 ? '50px' : '70px', 
              fontSize: isA6 ? '10px' : '11px', 
              fontWeight: 'bold', 
              padding: isA6 ? '4px' : '6px', 
              textAlign: 'center', 
              borderLeft: '2px solid #fff' 
            }}>
              QTY
            </div>
          </div>
          
          {/* Table Body (Fills all remaining height of the section) */}
          <div style={{ display: 'flex', flex: 1, backgroundColor: '#fff' }}>
            <div style={{ 
              flex: 1, 
              fontSize: isA6 ? '12px' : '15px', 
              padding: isA6 ? '6px 10px' : '10px 14px', 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word', 
              overflowWrap: 'break-word', 
              lineHeight: 1.3, 
              fontWeight: '600', 
              display: 'flex',
              alignItems: 'center',
              color: '#1e293b'
            }}>
              {label.productDetails || 'No details provided'}
            </div>
            <div style={{ 
              width: isA6 ? '50px' : '70px', 
              fontSize: isA6 ? '18px' : '24px', 
              fontWeight: '900', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              color: '#0B192C',
              borderLeft: '2px solid #0B192C'
            }}>
              {label.productDetails ? '1' : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
