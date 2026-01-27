export default function OrdersStatusRenderer(params) {
  const value = params.value;
  const colors = {
    pending: "#6b7280",
    preparing: "#2563eb",
    delivered: "#f59e0b",
    paid: "#16a34a",
    cancelled: "#dc2626",
  };
  const color = colors[value] || "#6b7280";
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        background: color,
        color: "white",
        fontSize: 12,
      }}
    >
      {value}
    </span>
  );
}


