// pages/InternalMessagingPage.tsx
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { httpClient } from '@/shared/api/httpClient';
import './InternalMessagingPage.css';

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
  { value: 'manager', label: '👔 Manager' },
];

const ADMIN_ROLE = 'admin';
const ADMIN_ID = '1';

export const InternalMessagingPage = () => {
  const [receiver, setReceiver] = useState<string>('kitchen');
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null); // ID-ul mesajului care se șterge
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    loadLatestMessages();
    // Auto-refresh la fiecare 10 secunde
    const interval = setInterval(loadLatestMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLatestMessages = async () => {
    setLoadingMessages(true);
    setLoadError(null);
    try {
      const response = await httpClient.get<InternalMessage[]>(`/api/messages/${ADMIN_ROLE}/${ADMIN_ID}`, {
        params: { limit: 50 },
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
    setFeedback(null);

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
      const response = await httpClient.post<{ message?: string; messageId?: number; error?: string }>('/api/messages/send', {
        senderType: ADMIN_ROLE,
        senderId: ADMIN_ID,
        receiverType: receiver,
        receiverId: '1',
        messageType: 'internal-message',
        messageContent: trimmedContent,
      });

      const data = response.data;
      if (data?.error) {
        setSendError(data.error);
        setFeedback({ type: 'error', message: data.error });
      } else {
        setFeedback({ type: 'success', message: data?.message ?? 'Mesaj trimis cu succes.' });
        setMessageContent('');
        await loadLatestMessages();
      }
    } catch (error: any) {
      const message = error?.response?.data?.error ?? error?.message ?? 'Nu am putut trimite mesajul.';
      setSendError(message);
      setFeedback({ type: 'error', message });
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

  const unreadCount = useMemo(() => {
    return filteredMessages.filter((m) => !m.is_read || m.is_read === 0).length;
  }, [filteredMessages]);

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest mesaj?')) {
      return;
    }

    setDeleting(messageId);
    setFeedback(null);
    try {
      const response = await httpClient.delete<{ message?: string; deletedId?: number; error?: string }>(`/api/messages/${messageId}`);
      const data = response.data;
      if (data?.error) {
        setFeedback({ type: 'error', message: data.error });
      } else {
        setFeedback({ type: 'success', message: data?.message ?? 'Mesaj șters cu succes.' });
        await loadLatestMessages();
      }
    } catch (error: any) {
      const message = error?.response?.data?.error ?? error?.message ?? 'Nu am putut șterge mesajul.';
      setFeedback({ type: 'error', message });
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAllMessages = async () => {
    if (!window.confirm('Ești sigur că vrei să ștergi TOATE mesajele? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setDeletingAll(true);
    setFeedback(null);
    try {
      const response = await httpClient.delete<{ message?: string; deletedCount?: number; error?: string }>(`/api/messages/${ADMIN_ROLE}/${ADMIN_ID}`);
      const data = response.data;
      if (data?.error) {
        setFeedback({ type: 'error', message: data.error });
      } else {
        setFeedback({ type: 'success', message: data?.message ?? `Au fost șterse ${data?.deletedCount ?? 'toate'} mesaje.` });
        await loadLatestMessages();
      }
    } catch (error: any) {
      const message = error?.response?.data?.error ?? error?.message ?? 'Nu am putut șterge mesajele.';
      setFeedback({ type: 'error', message });
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="internal-messaging-page" data-page-ready="true">
      <PageHeader
        title="Mesaj intern"
        description="Comunicare rapidă între echipă: bucătărie, bar, ospătari, manager. Mesajele sunt livrate instant prin canalul intern."
        actions={[
          {
            label: '↻ Reîmprospătează',
            variant: 'secondary',
            onClick: loadLatestMessages,
          },
        ]}
      />

      {feedback ? <InlineAlert type={feedback.type} message={feedback.message} /> : null}
      {loadError ? <InlineAlert type="error" message={loadError} /> : null}

      <div className="internal-messaging-layout">
        <section className="internal-messaging-history">
          <header className="internal-messaging-history-header">
            <h3>
              Istoric mesaje {unreadCount > 0 && <span className="unread-badge">{unreadCount} necitite</span>}
            </h3>
            <div className="internal-messaging-history-actions">
              <button
                type="button"
                className="internal-messaging-refresh"
                onClick={loadLatestMessages}
                disabled={loadingMessages}
              >
                {loadingMessages ? '⏳ Se încarcă…' : '🔄 Reîncarcă'}
              </button>
              {filteredMessages.length > 0 && (
                <button
                  type="button"
                  className="internal-messaging-delete-all"
                  onClick={handleDeleteAllMessages}
                  disabled={deletingAll}
                  title="Șterge toate mesajele"
                >
                  {deletingAll ? '⏳ Se șterg…' : '🗑️ Șterge toate'}
                </button>
              )}
            </div>
          </header>

          {filteredMessages.length === 0 ? (
            <div className="internal-messaging-empty">Nu există mesaje înregistrate.</div>
          ) : (
            <ul className="internal-messaging-list">
              {filteredMessages.map((message) => {
                const timestamp = new Intl.DateTimeFormat('ro-RO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }).format(new Date(message.timestamp));

                const isOutgoing = message.sender_type === ADMIN_ROLE && String(message.sender_id) === ADMIN_ID;
                const isUnread = !message.is_read || message.is_read === 0;

                return (
                  <li
                    key={message.id}
                    className={`internal-message-item ${isOutgoing ? 'internal-message-item--outgoing' : ''} ${isUnread ? 'internal-message-item--unread' : ''}`}
                  >
                    <div className="internal-message-meta">
                      <span className="internal-message-sender">
                        {isOutgoing ? '→ ' : '← '}
                        {message.sender_type.toUpperCase()} → {message.receiver_type.toUpperCase()}
                      </span>
                      <div className="internal-message-meta-right">
                        <span className="internal-message-time">{timestamp}</span>
                        <button
                          type="button"
                          className="internal-message-delete"
                          onClick={() => handleDeleteMessage(message.id)}
                          disabled={deleting === message.id}
                          title="Șterge mesajul"
                        >
                          {deleting === message.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </div>
                    <p className="internal-message-content">{message.message_content}</p>
                    {message.table_number && (
                      <span className="internal-message-table">Masa: {message.table_number}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="internal-messaging-compose">
          <h3>Trimite mesaj</h3>
          <form className="internal-messaging-form" onSubmit={handleSubmit}>
            <label className="internal-messaging-field">
              <span>Destinatar</span>
              <select value={receiver} onChange={(event) => setReceiver(event.target.value)}>
                {RECEIVER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="internal-messaging-field">
              <span>Mesaj</span>
              <textarea
                rows={6}
                value={messageContent}
                onChange={(event) => setMessageContent(event.target.value)}
                placeholder="Scrie mesajul pentru echipă…"
              />
            </label>

            {sendError ? <InlineAlert type="error" message={sendError} /> : null}

            <div className="internal-messaging-actions">
              <button type="submit" className="internal-messaging-button internal-messaging-button--primary" disabled={sending}>
                {sending ? '⏳ Se trimite…' : '📤 Trimite mesajul'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

