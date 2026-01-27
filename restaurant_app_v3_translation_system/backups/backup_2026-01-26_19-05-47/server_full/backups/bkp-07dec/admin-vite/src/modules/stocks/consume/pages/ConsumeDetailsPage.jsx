import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConsumeHeaderForm from "../components/ConsumeHeaderForm";
import ConsumeLinesGrid from "../components/ConsumeLinesGrid";
import ConsumeFooterSummary from "../components/ConsumeFooterSummary";
import ConsumeActionsBar from "../components/ConsumeActionsBar";
import NirErrorPanel from "../../nir/components/NirErrorPanel";
import { useConsume } from "../api/useConsume";
import { useConsumeStore } from "../store/consumeStore";
import { fromConsumePayload } from "../utils/consumeMapper";
import { InlineAlert } from "@/shared/components/InlineAlert";

export default function ConsumeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const consumptionId = Number(id);
  const { consumptionNote, loading, error, refetch } = useConsume(Number.isFinite(consumptionId) ? consumptionId : null);
  const { loadFromPayload, validation, reset } = useConsumeStore();

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (consumptionNote) {
      loadFromPayload(fromConsumePayload(consumptionNote));
    }
  }, [consumptionNote, loadFromPayload]);

  if (!consumptionId) {
    return <InlineAlert variant="error" title="Bon consum invalid" message="Nu a fost specificat un ID valid." />;
  }

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Detalii bon consum</h1>
          <p className="text-sm text-neutral-500">
            Consultă și editează informațiile bonului de consum. ID #{consumptionId}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={refetch}>
          ⟳ Reîmprospătează
        </button>
      </header>

      {error ? <InlineAlert variant="error" title="Eroare" message={error} /> : null}
      {loading && !consumptionNote ? (
        <InlineAlert variant="info" title="Se încarcă" message="Se încarcă detaliile bonului de consum..." />
      ) : null}

      <NirErrorPanel generalErrors={validation?.generalErrors} warnings={validation?.warnings} />

      <ConsumeHeaderForm />
      <ConsumeLinesGrid />
      <ConsumeFooterSummary />
      <ConsumeActionsBar
        mode="details"
        onAfterDelete={() => {
          navigate("/stocks/consume");
        }}
        onAfterSave={refetch}
      />
    </div>
  );
}

