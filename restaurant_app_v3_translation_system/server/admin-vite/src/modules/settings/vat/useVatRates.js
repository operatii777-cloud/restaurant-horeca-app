import { useEffect, useState } from "react";
import { fetchVatRates, createVatRate, updateVatRate, deleteVatRate } from "./vatApi";

export function useVatRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVatRates();
      setRates(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e) {
      setError(e.message || "Eroare la încărcarea cotelor TVA");
    } finally {
      setLoading(false);
    }
  }

  async function addRate(payload) {
    await createVatRate(payload);
    await load();
  }

  async function saveRate(id, payload) {
    await updateVatRate(id, payload);
    await load();
  }

  async function removeRate(id) {
    await deleteVatRate(id);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return { rates, loading, error, addRate, saveRate, removeRate, reload: load };
}


