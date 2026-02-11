
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        console.log('Starting PDF Generation with Puppeteer...');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Define file path
        const htmlPath = path.join(__dirname, 'certificate_template.html');
        console.log(`Loading HTML from: ${htmlPath}`);

        // Go to the local file
        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

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
        console.error('❌ Error generating PDF with Puppeteer:', error);
        process.exit(1);
    }
})();
