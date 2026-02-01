import React, { useState } from 'react';
import { Phone, Share2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';

export default function CallCenterSimulatorPage() {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSimulate = async () => {
        if (!phone) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/call-center/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: phone,
                    customerName: name || undefined
                })
            });
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setResult({ success: false, error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <PageHeader
                title="📞 Call Center Simulator"
                description="Simulează apeluri VoIP pentru testarea Caller ID"
            />

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mt-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Număr Telefon
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="07xx xxx xxx"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nume Client (Optional - Override)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Popescu Ion"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            * Dacă lași gol, sistemul va căuta în baza de date după telefon.
                        </p>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={loading || !phone}
                        className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Se trimite...' : <><Phone size={20} /> Simulează Apel</>}
                    </button>

                    {result && (
                        <div className={`p-4 rounded-lg mt-4 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {result.success ? <Share2 size={18} /> : <AlertCircle size={18} />}
                                <span className="font-bold">{result.success ? 'Succes!' : 'Eroare'}</span>
                            </div>
                            <pre className="text-xs overflow-auto max-h-40 bg-white/50 p-2 rounded border border-black/5">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                            {result.success && (
                                <p className="text-sm mt-2">
                                    🔔 Ar trebui să vezi popup-ul Caller ID în colțul ecranului.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
