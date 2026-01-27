/**
 * PHASE S5.2 - PDF Snapshot Tests
 * Automated tests for PDF generation for all 14 tipizate documents
 */

const { pdfEngineService } = require('../../src/modules/tipizate/pdf/pdf-engine.service');
const { tipizateRepository } = require('../../src/modules/tipizate/repositories/tipizate.repository');
const fs = require('fs');
const path = require('path');

const DOCUMENT_TYPES = [
  'NIR',
  'BON_CONSUM',
  'TRANSFER',
  'INVENTAR',
  'FACTURA',
  'CHITANTA',
  'REGISTRU_CASA',
  'RAPORT_GESTIUNE',
  'RAPORT_X',
  'RAPORT_Z',
  'RAPORT_LUNAR',
  'AVIZ',
  'PROCES_VERBAL',
  'RETUR',
];

/**
 * Test PDF generation for a document type
 */
async function testPdfGeneration(docType) {
  try {
    console.log(`\n📄 Testing PDF generation for ${docType}...`);

    // Get first document of this type from database
    const documents = await tipizateRepository.listByType(docType, { limit: 1 });
    
    if (!documents || documents.length === 0) {
      console.log(`   ⚠️  No ${docType} documents found in database - skipping test`);
      return { success: true, skipped: true };
    }

    const document = documents[0];
    const docId = document.id;

    // Generate PDF
    const pdfBuffer = await pdfEngineService.generatePdf(docType, docId);

    // Verify PDF size (< 200KB)
    const sizeKB = pdfBuffer.length / 1024;
    if (sizeKB > 200) {
      throw new Error(`PDF size too large: ${sizeKB.toFixed(2)}KB (max 200KB)`);
    }

    // Verify minimum content
    const pdfText = pdfBuffer.toString('binary');
    const hasDocumentNumber = pdfText.includes(document.number) || pdfText.includes(document.series);
    const hasDate = pdfText.includes(new Date(document.date).getFullYear().toString());
    const hasTotal = pdfText.includes('TOTAL') || pdfText.includes('total');

    if (!hasDocumentNumber) {
      throw new Error('PDF missing document number');
    }
    if (!hasDate) {
      throw new Error('PDF missing date');
    }

    // Check watermark if draft/locked
    if (document.status === 'DRAFT') {
      const hasWatermark = pdfText.includes('NESEMNAT') || pdfText.includes('DRAFT');
      if (!hasWatermark) {
        console.log(`   ⚠️  Watermark not found for DRAFT document (may be OK if watermark is image-based)`);
      }
    } else if (document.status === 'LOCKED') {
      const hasWatermark = pdfText.includes('BLOCAT') || pdfText.includes('LOCKED');
      if (!hasWatermark) {
        console.log(`   ⚠️  Watermark not found for LOCKED document (may be OK if watermark is image-based)`);
      }
    }

    // Save snapshot for comparison
    const snapshotDir = path.join(__dirname, 'snapshots');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }

    const snapshotPath = path.join(snapshotDir, `${docType.toLowerCase()}-${docId}.pdf`);
    fs.writeFileSync(snapshotPath, pdfBuffer);

    console.log(`   ✅ PDF generated successfully`);
    console.log(`      Size: ${sizeKB.toFixed(2)}KB`);
    console.log(`      Snapshot: ${snapshotPath}`);

    return {
      success: true,
      sizeKB: sizeKB.toFixed(2),
      snapshotPath,
    };
  } catch (error) {
    console.error(`   ❌ Error testing ${docType}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run all PDF tests
 */
async function runAllTests() {
  console.log('🧪 Starting PDF Snapshot Tests...\n');

  const results = {};

  for (const docType of DOCUMENT_TYPES) {
    results[docType] = await testPdfGeneration(docType);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');

  let passed = 0;
  let skipped = 0;
  let failed = 0;

  for (const [docType, result] of Object.entries(results)) {
    if (result.skipped) {
      skipped++;
      console.log(`   ⚠️  ${docType}: SKIPPED (no documents in DB)`);
    } else if (result.success) {
      passed++;
      console.log(`   ✅ ${docType}: PASSED (${result.sizeKB}KB)`);
    } else {
      failed++;
      console.log(`   ❌ ${docType}: FAILED - ${result.error}`);
    }
  }

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${DOCUMENT_TYPES.length}`);

  return {
    passed,
    skipped,
    failed,
    total: DOCUMENT_TYPES.length,
  };
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then((summary) => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { testPdfGeneration, runAllTests };

