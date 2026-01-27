// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import type { MenuProduct } from '@/types/menu';
import './ProductMessagesModal.css';

type InternalMessage = {
  id: number;
  sender_type: string;
  sender_id: string | number;
  receiver_type: string;
  receiver_id: string | number;
  message_type: string;
  message_content: string;
  timestamp: string;
  is_read?: number | boolean;
  table_number?: string | null;
};

type ProductMessagesModalProps = {
  open: boolean;
  product?: MenuProduct | null;
  onClose: () => void;
  onMessageSent: (message: string, createdId?: number) => void;
};

type SendMessageResponse = {
  message?: string;
  messageId?: number;
  error?: string;
};

const RECEIVER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: '📢 Toate compartimentele' },
  { value: 'kitchen', label: '👨‍🍳 Bucătărie' },
  { value: 'bar', label: '🍹 Bar' },
  { value: 'waiter1', label: '🍽️ Ospătar 1' },
  { value: 'waiter2', label: '🍽️ Ospătar 2' },
  { value: 'waiter3', label: '🍽️ Ospătar 3' },
  { value: 'waiter4', label: '🍽️ Ospătar 4' },
  { value: 'waiter5', label: '🍽️ Ospătar 5' },
  { value: 'waiter6', label: '🍽️ Ospătar 6' },
  { value: 'waiter7', label: '🍽️ Ospătar 7' },
  { value: 'waiter8', label: '🍽️ Ospătar 8' },
  { value: 'waiter9', label: '🍽️ Ospătar 9' },
  { value: 'waiter10', label: '🍽️ Ospătar 10' },
];

const ADMIN_ROLE = 'admin';
const ADMIN_ID = '1';

export function ProductMessagesModal({ open, product, onClose, onMessageSent }: ProductMessagesModalProps) {
//   const { t } = useTranslation();
  const [receiver, setReceiver] = useState<string>('kitchen');
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const defaultMessage = useMemo(() => {
    if (!product) {
      return '';
    }
    const category = product.category ? ` [${product.category}]` : '';
    return `Verificare produs: ${product.name}"Category"`;
  }, [product]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setReceiver('kitchen');
    setMessageContent(defaultMessage);
    setSendError(null);
    loadLatestMessages();
  }, [open, defaultMessage]);

  const loadLatestMessages = async () => {
    setLoadingMessages(true);
    setLoadError(null);
    try {
      const response = await httpClient.get<InternalMessage[]>(`/api/messages/${ADMIN_ROLE}/${ADMIN_ID}`, {
        params: { limit: 20 },
      });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      const message = error?.response?.data?.error ?? error?.message ?? 'Nu am putut încărca mesajele recente.';
      setLoadError(message);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendError(null);

    if (!receiver) {
      setSendError('Selectează un destinatar pentru mesaj.');
      return;
    }

    const trimmedContent = messageContent.trim();
    if (trimmedContent.length < 5) {
      setSendError('Mesajul trebuie să conțină cel puțin 5 caractere.');
      return;
    }

    setSending(true);
    try {
      const response = await httpClient.post<SendMessageResponse>('/api/messages/send', {
        senderType: ADMIN_ROLE,
        senderId: ADMIN_ID,
        receiverType: receiver,
        receiverId: '1',
        messageType: 'product-alert',
        messageContent: trimmedContent,
      });

      const data = response.data;
      if (data?.error) {
        setSendError(data.error);
      } else {
        onMessageSent(data?.message ?? 'Mesaj trimis cu succes.', data?.messageId);
        setMessageContent(defaultMessage);
        await loadLatestMessages();
      }
    } catch (error: any) {
      const message = error?.response?.data?.error ?? error?.message ?? 'Nu am putut trimite mesajul.';
      setSendError(message);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const isIncoming = message.receiver_type === ADMIN_ROLE && String(message.receiver_id) === ADMIN_ID;
      const isOutgoing = message.sender_type === ADMIN_ROLE && String(message.sender_id) === ADMIN_ID;
      return isIncoming || isOutgoing;
    });
  }, [messages]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={product ? `Mesaje interne · ${product.name}` : 'Mesaje interne'}
      description="Trimite notificări rapide către echipă: bucătărie, bar sau ospătari. Mesajele sunt livrate instant prin canalul intern."
      size="lg"
    >
      {loadError ? <InlineAlert variant="error" title="nu am putut incarca istoricul" message={loadError} /> : null}

      <div className="product-messages-layout">
        <section className="product-messages-history">
          <header>
            <h4>Istoric recent</h4>
            <button type="button" className="messages-refresh" onClick={loadLatestMessages} disabled={loadingMessages}>
              {loadingMessages ? 'Se încarcă…' : 'Reîncarcă'}
            </button>
          </header>

          {filteredMessages.length === 0 ? (
            <div className="product-messages-empty">"nu exista mesaje inregistrate pentru administrator"</div>
          ) : (
            <ul className="product-messages-list">
              {filteredMessages.map((message) => {
                const timestamp = new Intl.DateTimeFormat('ro-RO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }).format(new Date(message.timestamp));

                return (
                  <li key={message.id} className="product-message-item">
                    <div className="product-message-meta">
                      <span className="product-message-sender">{message.sender_type.toUpperCase()}</span>
                      <span className="product-message-time">{timestamp}</span>
                    </div>
                    <p className="product-message-content">{message.message_content}</p>
                    {message.table_number ? <span className="product-message-table">Masa: {message.table_number}</span> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="product-messages-compose">
          <form className="product-messages-form" onSubmit={handleSubmit}>
            <label className="product-messages-field">
              <span>Destinatar</span>
              <select value={receiver} onChange={(event) => setReceiver(event.target.value)}>
                {RECEIVER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="product-messages-field">
              <span>Mesaj</span>
              <textarea
                rows={4}
                value={messageContent}
                onChange={(event) => setMessageContent(event.target.value)}
                placeholder='[scrie_mesajul_pentru_echipa…]'
              />
            </label>

            {sendError ? <InlineAlert variant="warning" title="verifica mesajul" message={sendError} /> : null}

            <div className="product-messages-actions">
              <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={sending}>"Închide"</button>
              <button type="submit" className="menu-product-button menu-product-button--primary" disabled={sending}>
                {sending ? 'Se trimite…' : 'Trimite mesajul'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Modal>
  );
}





