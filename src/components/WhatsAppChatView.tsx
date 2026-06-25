"use client";

import { useEffect, useState } from "react";
import { MessageCircle, User, Bot, Clock, RefreshCw } from "lucide-react";

export type WhatsAppMessage = {
  id: string;
  from: string;
  employeeName: string;
  text: string;
  timestamp: string;
  type: 'inbound' | 'outbound';
};

export default function WhatsAppChatView() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/whatsapp/messages');
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      
      // Sort messages by timestamp descending (newest first)
      const sorted = (data as WhatsAppMessage[]).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setMessages(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)] animate-pulse">Loading conversation history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-glass-strong)]">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-[var(--green-brand)]" size={20} />
          <h3 className="font-semibold text-[var(--text-main)] m-0">WhatsApp Communications</h3>
        </div>
        <button 
          onClick={fetchMessages} 
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-[var(--bg-glass-hover)] transition-colors disabled:opacity-50"
          title="Refresh messages"
        >
          <RefreshCw size={16} className={`text-[var(--text-muted)] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] opacity-50">
            <MessageCircle size={48} className="mb-4" />
            <p>No messages recorded yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.type === 'inbound' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`flex flex-col max-w-[75%] rounded-2xl p-3 shadow-sm
                  ${msg.type === 'inbound' 
                    ? 'bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-tl-sm' 
                    : 'bg-[var(--green-soft)] border border-[var(--green-brand)]/20 rounded-tr-sm'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs text-[var(--text-muted)]">
                  {msg.type === 'inbound' ? (
                    <>
                      <User size={12} />
                      <span className="font-medium text-[var(--text-main)]">{msg.employeeName}</span>
                      <span>• {msg.from}</span>
                    </>
                  ) : (
                    <>
                      <Bot size={12} className="text-[var(--green-brand)]" />
                      <span className="font-medium text-[var(--green-brand)]">EnxtBrain AI</span>
                      <span>to {msg.employeeName}</span>
                    </>
                  )}
                </div>
                
                <p className="text-sm text-[var(--text-main)] whitespace-pre-wrap leading-relaxed m-0">
                  {msg.text}
                </p>
                
                <div className="flex items-center justify-end gap-1 mt-2 opacity-50 text-[10px] text-[var(--text-muted)]">
                  <Clock size={10} />
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{new Date(msg.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
