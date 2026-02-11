
const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
    try {
        console.log('Starting PDF Generation...');
        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Define file path
        const htmlPath = path.join(__dirname, 'certificate_template.html');
        console.log(`Loading HTML from: ${htmlPath}`);

        // Go to the local file
        await page.goto(`file://${htmlPath}`);

        // Generate PDF
        const pdfPath = path.join(__dirname, 'CERTIFICAT_HORECA_ANTIGRAVITY.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });

        console.log(`✅ PDF Certificate generated successfully at: ${pdfPath}`);
        await browser.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    }
})();
