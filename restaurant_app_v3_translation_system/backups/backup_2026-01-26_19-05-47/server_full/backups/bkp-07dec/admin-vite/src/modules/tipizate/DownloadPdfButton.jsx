// src/modules/tipizate/DownloadPdfButton.jsx
// Componentă reutilizabilă pentru butoane de descărcare PDF

import React from "react";

export default function DownloadPdfButton({ url, label, className = "" }) {
  const handleClick = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!url}
      className={
        "px-2 py-1 rounded-md border text-xs bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed " +
        className
      }
    >
      {label || "PDF"}
    </button>
  );
}

