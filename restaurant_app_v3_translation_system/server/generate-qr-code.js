const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateCertificateQR() {
    try {
        // URL de verificare a certificatului
        const verificationUrl = 'http://localhost:3008/verify-certificate?id=GA-2026-HORECA-001&date=2026-02-07';

        // Generează QR code ca Data URL
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            color: {
                dark: '#667eea',
                light: '#ffffff'
            },
            width: 200
        });

        // Salvează QR code ca imagine
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrPath = path.join(__dirname, 'public', 'certificate-qr.png');
        fs.writeFileSync(qrPath, base64Data, 'base64');

        console.log('✅ QR Code generated successfully at:', qrPath);
        console.log('📱 Verification URL:', verificationUrl);

        return qrDataUrl;
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
        throw error;
    }
}

generateCertificateQR()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
