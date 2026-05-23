import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ChatPage() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch all conversations
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const fetchConversations = async () => {
      try {
        const { data } = await apiClient.get('/chat/conversations/');
        setConversations(data.results || data);
      } catch (e) {
        console.error('Failed to fetch conversations', e);
      }
    };
    fetchConversations();
  }, [user, navigate]);

  // If sellerId is provided in URL, either select existing conversation or create a new one
  useEffect(() => {
    if (!sellerId || !user) return;
    
    const setupConversation = async () => {
      try {
        const { data } = await apiClient.post('/chat/conversations/', { participant_id: sellerId });
        setActiveConv(data);
      } catch (e) {
        console.error('Failed to start conversation', e);
      }
    };
    setupConversation();
  }, [sellerId, user]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      try {
        const { data } = await apiClient.get(`/chat/conversations/${activeConv.id}/messages/`);
        setMessages(data.results || data);
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }
    };
    fetchMessages();
    
    // Simple polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    try {
      const { data } = await apiClient.post(`/chat/conversations/${activeConv.id}/messages/`, {
        content: newMessage
      });
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send message', e);
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
              const otherUser = conv.participant1.id === user.id ? conv.participant2 : conv.participant1;
              return (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveConv(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-3 ${activeConv?.id === conv.id ? 'bg-indigo-50 border-indigo-100' : ''}`}
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase">
                    {otherUser.first_name ? otherUser.first_name[0] : otherUser.username[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {otherUser.first_name || otherUser.username}
                    </div>
                    {conv.last_message && (
                      <div className="text-sm text-gray-500 truncate">
                        {conv.last_message.content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-gray-100 font-bold text-lg text-gray-900 flex items-center gap-3">
              Чат
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isMe = msg.sender === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Введіть повідомлення..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
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
