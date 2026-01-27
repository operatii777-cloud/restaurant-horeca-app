/**
 * Split Bill API
 * 
 * API calls pentru funcționalitatea Split Bill
 */

import { httpClient } from '@/shared/api/httpClient';

/**
 * Obține statusul plăților pentru o comandă cu split bill
 * @param {number} orderId - ID-ul comenzii
 * @returns {Promise<Object>} Status per grup
 */
export const getSplitBillStatus = async (orderId) => {
  try {
    const response = await httpClient.get(`/api/split-bill/order/${orderId}/status`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting split bill status:', error);
    throw error;
  }
};

/**
 * Procesează o plată pentru un grup specific
 * @param {number} orderId - ID-ul comenzii
 * @param {number} groupId - ID-ul grupului
 * @param {number} amount - Suma plătită
 * @param {string} method - Metoda de plată
 * @returns {Promise<Object>} Rezultatul plății
 */
export const processGroupPayment = async (orderId, groupId, amount, method) => {
  try {
    const response = await httpClient.post(`/api/split-bill/order/${orderId}/pay`, {
      groupId,
      amount,
      method
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error processing group payment:', error);
    throw error;
  }
};

