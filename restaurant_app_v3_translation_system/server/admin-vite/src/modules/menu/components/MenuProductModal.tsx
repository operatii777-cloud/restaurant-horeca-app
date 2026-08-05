import type { MenuProduct } from '@/types/menu';

type Props = {
  open: boolean;
  product?: MenuProduct | null;
  onClose: () => void;
  onSaved?: () => void;
  [key: string]: any;
};

/** Build-safe stub — full modal source was corrupted in repo. */
export function MenuProductModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="padding-20">
      <p>Editor produs temporar indisponibil (sursă coruptă).</p>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Închide</button>
    </div>
  );
}

export default MenuProductModal;
