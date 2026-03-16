'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I am Ty, your TyFix assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Mock bot response logic
    setTimeout(() => {
      const lower = input.toLowerCase();
      let botText = "I'm not sure about that. Would you like to speak with one of our specialists? You can call us at (555) 123-4567.";

      if (lower.includes('inventory') || lower.includes('cars') || lower.includes('stock')) {
        botText = "We have a great selection of quality vehicles under $5,000! You can browse our current inventory right here on the site. Is there a specific make or model you're looking for?";
      } else if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
        botText = "We are located in Coney Island, Brooklyn, NY. Come visit us today!";
      } else if (lower.includes('phone') || lower.includes('call') || lower.includes('contact')) {
        botText = "You can reach us at (555) 123-4567. We're happy to answer any questions!";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('money')) {
        botText = "All our cars are priced to sell, mostly under $5,000. We deal in cash to keep prices low and transparent—no interest, no credit checks!";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        botText = "Hello! How can I assist you with your car search today?";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Open chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-100">
            Have a question?
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">TyFix Assistant</p>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Always online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
