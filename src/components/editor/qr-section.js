import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, InputGroup } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';

// create image URL for QR code using online API
export function getQR(text) {
  const encodedText = encodeURIComponent(text || 'no-data');
  // Using QR Server API - free online QR code generator
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedText}&format=png&bgcolor=ffffff&color=000000`;
  return qrUrl;
}

// define the new custom section
export const QrSection = {
  name: 'qr',
  Tab: (props) => (
    <SectionTab name="Qr" {...props}>
      <Icon icon="barcode" />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }) => {
    const [val, setVal] = React.useState('');

    const el = store.selectedElements[0];
    const isQR = el?.name === 'qr';

    // if selection is changed we need to update input value
    React.useEffect(() => {
      if (el?.custom?.value) {
        setVal(el?.custom.value);
      }
    }, [isQR, el]);

    // update image src when we change input data
    React.useEffect(() => {
      if (isQR) {
        const src = getQR(val);
        el.set({
          src,
          custom: {
            value: val,
          },
        });
      }
    }, [el, val, isQR]);

    return (
      <div style={{ padding: '20px', height: '100%' }}>
        {isQR && <p style={{ marginBottom: '15px', color: '#333', fontSize: '14px' }}>Update select QR code:</p>}
        {!isQR && <p style={{ marginBottom: '15px', color: '#333', fontSize: '14px' }}>Create new QR code:</p>}
        <InputGroup
          onChange={(e) => {
            setVal(e.target.value);
          }}
          placeholder="Type qr code content"
          value={val}
          style={{
            width: '100%',
            marginBottom: '15px'
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '10px',
          }}
        >
          <Button
            style={{
              display: isQR ? '' : 'none',
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: '600',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #495057 0%, #343a40 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
            }}
            onClick={() => {
              store.selectElements([]);
              setVal('');
            }}
          >
            Cancel
          </Button>
          <Button
            style={{
              display: isQR ? 'none' : '',
              background: 'linear-gradient(135deg, #0066cc 0%, #4285f4 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: '600',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 102, 204, 0.3)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #0052a3 0%, #0066cc 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 102, 204, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #0066cc 0%, #4285f4 100%)';
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 102, 204, 0.3)';
            }}
            onClick={async () => {
              try {
                const src = getQR(val);

                store.activePage.addElement({
                  type: 'image',
                  name: 'qr',
                  x: 50,
                  y: 50,
                  width: 200,
                  height: 200,
                  src,
                  custom: {
                    value: val,
                  },
                });
              } catch (error) {
                console.error('Error creating QR code:', error);
              }
            }}
          >
            Add new QR code
          </Button>
        </div>
      </div>
    );
  }),
};