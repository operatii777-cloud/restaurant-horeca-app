/**
 * Test Script - Receipt PDF Price Display Fix
 * 
 * This script tests the fix for the "NaN RON" bug in receipt PDFs
 * by creating a test order and generating its receipt.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

async function testReceiptPDFGeneration() {
    console.log('🧪 Testing Receipt PDF Generation Fix...\n');

    try {
        // Step 1: Create a test order
        console.log('1️⃣ Creating test order...');
        const orderResponse = await axios.post(`${BASE_URL}/api/orders/create`, {
            type: 'dine_in',
            items: [
                {
                    product_id: 1,
                    name: 'Caffe Latte',
                    quantity: 1,
                    price: 15.00
                },
                {
                    product_id: 2,
                    name: '7 Up',
                    quantity: 1,
                    price: 15.00
                }
            ],
            total: 30.00,
            table: '1',
            payment_method: 'cash',
            platform: 'TEST'
        });

        const orderId = orderResponse.data?.orderId || orderResponse.data?.order_id || orderResponse.data?.id;
        console.log(`✅ Order created: ID ${orderId}\n`);

        // Step 2: Generate receipt PDF
        console.log('2️⃣ Generating receipt PDF...');
        const pdfResponse = await axios.get(`${BASE_URL}/api/orders/${orderId}/receipt`, {
            responseType: 'arraybuffer'
        });

        // Step 3: Save PDF to file
        const outputPath = path.join(__dirname, `test-receipt-${orderId}.pdf`);
        fs.writeFileSync(outputPath, pdfResponse.data);
        console.log(`✅ PDF saved to: ${outputPath}\n`);

        // Step 4: Verify PDF was generated
        const stats = fs.statSync(outputPath);
        console.log(`📄 PDF Size: ${stats.size} bytes`);

        if (stats.size > 1000) {
            console.log('\n✅ SUCCESS! Receipt PDF generated successfully.');
            console.log('📝 Please open the PDF manually to verify:');
            console.log('   - Product prices are displayed correctly (not "NaN RON")');
            console.log('   - Text is not overlapping');
            console.log(`\n📂 PDF Location: ${outputPath}`);
        } else {
            console.log('\n⚠️  WARNING: PDF file is very small, might be corrupted.');
        }

    } catch (error) {
        console.error('\n❌ Error during test:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`   ${error.message}`);
        }
    }
}

// Run the test
testReceiptPDFGeneration();
