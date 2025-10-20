import React, { useState } from 'react';
import { Toolbar as PolotnoToolbar } from 'polotno/toolbar/toolbar';
import { observer } from 'mobx-react-lite';
import { Icon, Dialog, Button, HTMLSelect, Slider } from '@blueprintjs/core';
import ColorPicker from 'polotno/toolbar/color-picker';

const None = () => null;

// Custom Page Background dengan styling custom tapi fungsionalitas polotno
const CustomPageBackground = observer(({ store }) => {
    const activePage = store.activePage;

    // Jika tidak ada active page, jangan render apapun
    if (!activePage) return null;

    return (
        <div
            style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.375rem',
                overflow: 'visible',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-2px)', // Geser sedikit ke atas
                minWidth: '28px',
                minHeight: '28px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <ColorPicker
                value={activePage.background || '#ffffff'}
                onChange={(background) => {
                    activePage.set({
                        background: background,
                    });
                }}
                store={store}
                showOpacity={true}
                showGradient={true}
                buttonStyle={{
                    width: '100%',
                    height: '100%',
                    minWidth: '28px',
                    minHeight: '28px',
                    border: '1px solid #e8e8e8',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    padding: '0',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            />
        </div>
    );
});

// Custom Download Button dengan modal lengkap
const CustomDownloadButton = observer(({ store }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fileType, setFileType] = useState('PNG');
    const [quality, setQuality] = useState(1);

    // Mengambil dimensi dari store secara dinamis
    const getCanvasDimensions = () => {
        if (!store || !store.activePage) {
            return { width: 1080, height: 1080 };
        }
        return {
            width: store.width || store.activePage.width || 1080,
            height: store.height || store.activePage.height || 1080
        };
    };

    const { width, height } = getCanvasDimensions();

    const handleDownload = async () => {
        try {
            if (fileType === 'PNG') {
                // Menggunakan pixelRatio untuk kualitas tanpa mengubah dimensi canvas
                await store.saveAsImage({
                    pixelRatio: quality,
                    mimeType: 'image/png'
                });
            } else if (fileType === 'JPEG') {
                // Menggunakan pixelRatio untuk kualitas tanpa mengubah dimensi canvas
                await store.saveAsImage({
                    pixelRatio: quality,
                    mimeType: 'image/jpeg'
                });
            } else if (fileType === 'PDF') {
                // Untuk PDF tetap gunakan pixelRatio
                await store.saveAsPDF({
                    pixelRatio: quality
                });
            } else if (fileType === 'SVG') {
                // SVG tidak perlu pixelRatio, menggunakan dimensi asli canvas
                await store.saveAsSVG();
            } else if (fileType === 'HTML') {
                // HTML tidak perlu pixelRatio, menggunakan dimensi asli canvas
                await store.saveAsHTML();
            } else if (fileType === 'GIF') {
                // GIF menggunakan pixelRatio seperti sebelumnya
                await store.saveAsGIF({
                    pixelRatio: quality
                });
            } else if (fileType === 'JSON') {
                // JSON tetap sama
                const json = store.toJSON();
                const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'design.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            setIsOpen(false);
        } catch (error) {
            console.error('Download error:', error);
            alert('Error saat download: ' + error.message);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    width: '32px',
                    height: '32px',
                    background: '#ffffff',
                    border: '1px solid #e8e8e8',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: '0'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <Icon icon="download" style={{ fontSize: '16px', color: '#020202ff' }} />
            </button>

            <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
                style={{
                    width: '200px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)'
                }}
                className="download-modal"
            >
                <div style={{
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
                }}>
                    {/* Header */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(79, 134, 247, 0.1)',
                        paddingBottom: '12px'
                    }}>
                        <Icon
                            icon="download"
                            style={{
                                fontSize: '20px',
                                color: '#4f86f7',
                                marginBottom: '4px'
                            }}
                        />
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#2c3e50',
                            letterSpacing: '0.3px'
                        }}>
                            Export Design
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            File Format
                        </label>
                        <select
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                                color: '#2c3e50',
                                border: '1px solid rgba(79, 134, 247, 0.2)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                fontSize: '13px',
                                height: '40px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(79, 134, 247, 0.08)',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                paddingRight: '40px'
                            }}
                        >
                            <option value="PNG">PNG</option>
                            <option value="JPEG">JPEG</option>
                            <option value="PDF">PDF</option>
                            <option value="SVG">SVG</option>
                            <option value="GIF">GIF</option>
                            <option value="JSON">JSON</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Quality Scale
                        </label>
                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            padding: '12px',
                            border: '1px solid rgba(79, 134, 247, 0.1)',
                            marginBottom: '8px'
                        }}>
                            <Slider
                                min={1}
                                max={3.5}
                                step={0.5}
                                value={quality}
                                onChange={setQuality}
                                labelRenderer={(value) => `${value}x`}
                                showTrackFill={true}
                            />
                        </div>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#4f86f7',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #4f86f7 0%, #6366f1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.3px'
                        }}>
                            {Math.round(width * quality)} × {Math.round(height * quality)} px
                        </div>
                    </div>

                    <Button
                        onClick={handleDownload}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #4f86f7 0%, #6366f1 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            height: '44px',
                            boxShadow: '0 4px 16px rgba(79, 134, 247, 0.3)',
                            transition: 'all 0.2s ease',
                            letterSpacing: '0.3px',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 24px rgba(79, 134, 247, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0px)';
                            e.target.style.boxShadow = '0 4px 16px rgba(79, 134, 247, 0.3)';
                        }}
                    >
                        <Icon icon="download" style={{ marginRight: '6px', fontSize: '12px', color: '#ffffffff' }} />
                        Download {fileType}
                    </Button>
                </div>
            </Dialog>
        </>
    );
});

// Custom Action Controls dengan download button custom
const CustomActionControls = ({ store }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        }}>
            <CustomDownloadButton store={store} />
        </div>
    );
};

const ToolbarAdmin = ({ store }) => (
    <PolotnoToolbar
        store={store}
        components={{
            Remove: None,
            Position: None,
            Duplicate: None,
            // Custom page background color picker
            PageBackground: CustomPageBackground,
            // Custom download button area
            ActionControls: CustomActionControls
        }}
    />
);

export default ToolbarAdmin;