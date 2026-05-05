import React, { useEffect } from 'react';
import { SenderProfile, LabelRecord } from '../types';

interface PrintableLabelProps {
  sender?: SenderProfile;
  label: LabelRecord;
  pageSize?: 'A6' | 'A5';
}

export function PrintableLabel({ sender, label, pageSize = 'A6' }: PrintableLabelProps) {
  if (!sender) return null;

  const isA6 = pageSize === 'A6';
  
  // Base dimensions strictly in px mapping to CSS units (96dpi standard)
  const widthPx = isA6 ? '397px' : '560px';
  const minHeightPx = isA6 ? '560px' : '794px';
  const paddingPx = isA6 ? '16px' : '24px';

  // Typography mapped to the sensible CSS sizes
  const smallSize = isA6 ? '12px' : '14px';
  const normalSize = isA6 ? '14px' : '16px';
  const boldSize = isA6 ? '16px' : '20px';
  const largestSize = isA6 ? '28px' : '36px';

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

  return (
    <table 
      id="printable-label" 
      style={{ 
        width: widthPx,
        minHeight: minHeightPx,
        borderCollapse: 'collapse', 
        borderSpacing: 0, 
        margin: 0, 
        padding: 0, 
        tableLayout: 'fixed',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        lineHeight: 1.3,
        boxSizing: 'border-box'
      }}
    >
      <tbody>
        {/* ROW 1: HEADER SECTION */}
        <tr>
          <td style={{ padding: paddingPx, verticalAlign: 'top', height: '1%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, padding: 0 }}>
              <tbody>
                <tr>
                  <td style={{ width: '80%', padding: 0, verticalAlign: 'top', textAlign: 'left' }}>
                    <div style={{ fontSize: boldSize, fontWeight: 'bold', margin: '0 0 4px 0', padding: 0 }}>{sender.businessName}</div>
                    {sender.address && (
                      <div style={{ fontSize: normalSize, margin: '4px 0 0 0', padding: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {sender.address}
                      </div>
                    )}
                    {sender.phone && (
                      <div style={{ fontSize: normalSize, margin: '4px 0 0 0', padding: 0 }}>
                        {sender.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ width: '20%', padding: 0, verticalAlign: 'top', textAlign: 'right' }}>
                    {sender.logo && (
                      <img 
                        src={sender.logo} 
                        alt="Logo" 
                        style={{ maxHeight: isA6 ? '48px' : '64px', maxWidth: '100%', objectFit: 'contain' }} 
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        {/* ROW 2: DIVIDER */}
        <tr>
          <td style={{ padding: `0 ${paddingPx}`, height: '1%' }}>
            <div style={{ borderTop: '1px solid #000', height: '1px', width: '100%', padding: 0, margin: '8px 0' }}></div>
          </td>
        </tr>

        {/* ROW 3: SHIP TO SECTION */}
        <tr>
          <td style={{ padding: `8px ${paddingPx}`, verticalAlign: 'top', textAlign: 'left', height: '1%' }}>
            <div style={{ fontSize: smallSize, fontWeight: 'bold', margin: '0 0 8px 0', padding: 0 }}>SHIP TO:</div>
            
            <div style={{ 
              fontSize: largestSize, 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              margin: '8px 0', 
              padding: 0, 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word', 
              lineHeight: 1.1 
            }}>
              {label.recipient.name}
            </div>

            {label.recipient.phone && (
              <div style={{ fontSize: normalSize, margin: '8px 0', padding: 0 }}>
                {label.recipient.phone}
              </div>
            )}
            
            <div style={{ 
              fontSize: normalSize, 
              margin: '8px 0 0 0', 
              padding: 0, 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word' 
            }}>
              {label.recipient.address}
            </div>
          </td>
        </tr>

        {/* ROW 4: DIVIDER */}
        <tr>
          <td style={{ padding: `0 ${paddingPx}`, height: '1%' }}>
            <div style={{ borderTop: '1px solid #000', height: '1px', width: '100%', padding: 0, margin: '8px 0' }}></div>
          </td>
        </tr>

        {/* ROW 5: PRODUCT SECTION */}
        <tr>
          <td style={{ padding: `8px ${paddingPx}`, verticalAlign: 'top', textAlign: 'left', height: 'auto' }}>
            <div style={{ fontSize: smallSize, fontWeight: 'bold', margin: '0 0 8px 0', padding: 0 }}>PRODUCT DETAILS:</div>
            <div style={{ 
              fontSize: normalSize, 
              margin: 0, 
              padding: 0, 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {label.productDetails || 'N/A'}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

