import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, X } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const formatMessageTime = (dateString, fullFormat = false) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }

  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    const dayStr = date.toLocaleDateString('uk-UA', { weekday: 'short' });
    return fullFormat ? `${dayStr} ${timeStr}` : dayStr;
  }

  const dateStr = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
  return fullFormat ? `${dateStr} ${timeStr}` : dateStr;
};

const getMessageClass = (msg, isMe) => {
  if (msg.is_deleted) {
    return 'bg-gray-50 text-gray-400 italic border border-gray-100';
  }
  if (isMe) {
    return 'bg-indigo-600 text-white';
  }
  return 'bg-gray-100 text-gray-900';
};

export default function ChatPage() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('product');
  const { showConfirm } = useModal();
  
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all conversations
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const fetchConversations = async () => {
      try {
        const { data } = await apiClient.get('/chat/');
        setConversations(data.results || data);
      } catch (e) {
        console.error('Failed to fetch conversations', e);
      }
    };
    fetchConversations();
    
    // Poll conversations every 10 seconds to update unread counts and new messages in sidebar
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  // If sellerId is provided in URL, either select existing conversation or create a new one
  useEffect(() => {
    if (!sellerId || !user) return;
    
    const setupConversation = async () => {
      try {
        const payload = { seller_id: sellerId };
        if (productId) payload.product_id = productId;

        const { data } = await apiClient.post('/chat/create/', payload);
        setActiveConv(data);
        if (data.messages) {
          setMessages(data.messages);
        }
        setConversations(prev => {
          if (!prev.some(c => c.id === data.id)) return [data, ...prev];
          return prev;
        });
      } catch (e) {
        console.error('Failed to start conversation', e);
      }
    };
    setupConversation();
  }, [sellerId, productId, user]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    
    const fetchMessages = async () => {
      try {
        const { data } = await apiClient.get(`/chat/${activeConv.id}/`);
        setMessages(data.messages || []);
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }
    };
    
    // Initial fetch
    fetchMessages();
    
    // Simple polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const handleEditClick = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDeleteClick = async (msgId) => {
    const confirmed = await showConfirm('Ви впевнені, що хочете видалити це повідомлення? Цю дію неможливо скасувати.');
    if (confirmed) {
      try {
        const { data } = await apiClient.delete(`/chat/messages/${msgId}/`);
        setMessages(data.messages || []);
      } catch (e) {
        console.error('Failed to delete message', e);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    try {
      let response;
      if (editingMessage) {
        response = await apiClient.patch(`/chat/messages/${editingMessage.id}/`, {
          text: newMessage
        });
        setEditingMessage(null);
      } else {
        response = await apiClient.post(`/chat/${activeConv.id}/messages/`, {
          text: newMessage
        });
      }
      // Backend returns the updated ConversationDetailSerializer
      setMessages(response.data.messages || []);
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send/edit message', e);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white font-bold text-lg text-gray-900">
          Ваші діалоги
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Немає активних діалогів</div>
          ) : (
            conversations.map(conv => {
              const otherUser = conv.participants.find(p => p.id !== user.id) || conv.participants[0];
              return (
                <button
                  type="button"
                  key={conv.id} 
                  onClick={() => { setActiveConv(conv); setMessages(conv.messages || []); navigate('/chat', {replace: true}); setEditingMessage(null); setNewMessage(''); }}
                  className={`w-full text-left p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-3 ${activeConv?.id === conv.id ? 'bg-indigo-50 border-indigo-100' : ''}`}
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase shrink-0">
                    {otherUser?.first_name ? otherUser.first_name[0] : (otherUser?.username?.[0] || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate flex justify-between items-center mb-1">
                      <span className="truncate pr-2">{otherUser?.first_name || otherUser?.username || 'Користувач'}</span>
                      {conv.last_message && (
                        <span className="text-xs font-normal text-gray-400 shrink-0">
                          {formatMessageTime(conv.last_message.created_at, false)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      {conv.last_message ? (
                        <div className={`text-sm ${conv.last_message.is_deleted ? 'text-gray-400 italic' : 'text-gray-500'} truncate pr-2`}>
                          <span className="font-medium">{conv.last_message.sender === user.username ? 'Ви: ' : ''}</span>
                          {conv.last_message.is_deleted ? "Повідомлення видалено" : conv.last_message.text}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic">Немає повідомлень</div>
                      )}
                      
                      {conv.unread_count > 0 && activeConv?.id !== conv.id && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 flex flex-col bg-white relative">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-gray-100 font-bold text-lg text-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Чат</span>
                {activeConv.product && (
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full truncate max-w-[200px]">
                    Товар: {activeConv.product.name}
                  </span>
                )}
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    Напишіть перше повідомлення
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender?.id === user.id;
                    return (
                      <div key={msg.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                          {isMe && !msg.is_deleted && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditClick(msg)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors" title="Редагувати">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteClick(msg.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" title="Видалити">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${getMessageClass(msg, isMe)} ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                            {msg.is_deleted ? "Повідомлення видалено" : msg.text}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {msg.is_edited && !msg.is_deleted && (
                            <span className="text-xs text-gray-400">(відредаговано)</span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(msg.created_at, true)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input */}
            <div className="bg-white">
              {editingMessage && (
                <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex justify-between items-center text-sm text-indigo-700">
                  <span className="flex items-center gap-2 font-medium">
                    <Pencil className="w-4 h-4" />
                    Редагування повідомлення
                  </span>
                  <button onClick={cancelEdit} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className={`p-4 border-t border-gray-100 flex gap-2 ${editingMessage ? 'bg-indigo-50/30' : ''}`}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Введіть повідомлення..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || (editingMessage && newMessage === editingMessage.text)}
                  className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  {editingMessage ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Оберіть діалог зліва, щоб почати спілкування
          </div>
        )}
      </div>
    </div>
  );
}
