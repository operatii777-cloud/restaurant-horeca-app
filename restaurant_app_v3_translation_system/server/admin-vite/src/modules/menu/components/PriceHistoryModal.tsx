type Props = { open?: boolean; onClose?: () => void; [key: string]: any };
export function PriceHistoryModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="padding-20">
      <p>Istoric prețuri temporar indisponibil.</p>
      <button type="button" onClick={onClose}>Închide</button>
    </div>
  );
}
export default PriceHistoryModal;
