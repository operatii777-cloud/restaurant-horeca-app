export default function OrdersFiscalRenderer(params) {
  const value = params.value;
  const isYes = Number(value || 0) > 0;
  return isYes ? (
    <span style={{ color: "#16a34a", fontWeight: 700 }}>✔</span>
  ) : (
    <span style={{ color: "#dc2626" }}>✘</span>
  );
}


