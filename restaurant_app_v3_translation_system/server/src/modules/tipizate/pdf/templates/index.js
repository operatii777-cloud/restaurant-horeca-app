/**
 * PHASE S5.2 - Templates Index (CommonJS)
 * Export all individual document templates
 */

const { renderNirTemplate } = require('./nir.template');
const { renderBonConsumTemplate } = require('./bon-consum.template');
const { renderTransferTemplate } = require('./transfer.template');
const { renderInventarTemplate } = require('./inventar.template');
const { renderWasteTemplate } = require('./waste.template');
const { renderFacturaTemplate } = require('./factura.template');
const { renderChitantaTemplate } = require('./chitanta.template');
const { renderRegistruCasaTemplate } = require('./registru-casa.template');
const { renderRaportGestiuneTemplate } = require('./raport-gestiune.template');
const { renderRaportXTemplate } = require('./raport-x.template');
const { renderRaportZTemplate } = require('./raport-z.template');
const { renderRaportLunarTemplate } = require('./raport-lunar.template');
const { renderAvizTemplate } = require('./aviz.template');
const { renderProcesVerbalTemplate } = require('./proces-verbal.template');
const { renderReturTemplate } = require('./retur.template');

module.exports = {
  renderNirTemplate,
  renderBonConsumTemplate,
  renderTransferTemplate,
  renderInventarTemplate,
  renderWasteTemplate,
  renderFacturaTemplate,
  renderChitantaTemplate,
  renderRegistruCasaTemplate,
  renderRaportGestiuneTemplate,
  renderRaportXTemplate,
  renderRaportZTemplate,
  renderRaportLunarTemplate,
  renderAvizTemplate,
  renderProcesVerbalTemplate,
  renderReturTemplate,
};

