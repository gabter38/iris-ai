import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MODES = {
  chat: { label: 'Chat', icon: '💬', desc: 'Discussion générale' },
  code: { label: 'Code', icon: '💻', desc: 'Expert programmation' },
  image: { label: 'Image', icon: '🎨', desc: 'Génération d\'images' },
};

function App() {
  const [mode, setMode] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis **Iris**, votre assistante IA. Choisissez un mode et commençons ! 🌸' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    if (mode === 'image') {
      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input })
        });
        const data = await res.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `image:${data.url}`,
          prompt: input
        }]);
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur lors de la génération d\'image.' }]);
      }
      setLoading(false);
      return;
    }

    // Chat / Code mode with streaming
    const apiMessages = newMessages
      .filter(m => !m.content.startsWith('image:'))
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMsg = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content || '';
              assistantMsg += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
                return updated;
              });
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur de connexion au serveur.' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Nouvelle conversation démarrée ! Comment puis-je vous aider ? 🌸' }]);
  };

  const renderMessage = (msg, i) => {
    const isUser = msg.role === 'user';
    const isImage = msg.content.startsWith('image:');

    return (
      <div key={i} className={`message-row ${isUser ? 'user' : 'assistant'}`}>
        {!isUser && <div className="avatar iris-avatar">🌸</div>}
        <div className={`bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          {isImage ? (
            <div className="image-result">
              <p className="image-prompt">🎨 "{msg.prompt}"</p>
              <img src={msg.content.slice(6)} alt={msg.prompt} className="generated-img" />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="code-block-wrapper">
                      <div className="code-lang">{match[1]}</div>
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(String(children))}>📋 Copier</button>
                      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="inline-code" {...props}>{children}</code>
                  );
                }
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        {isUser && <div className="avatar user-avatar">👤</div>}
      </div>
    );
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="iris-logo">
            <span className="logo-icon">🌸</span>
            <span className="logo-text">IRIS AI</span>
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="mode-nav">
          <p className="nav-label">MODE</p>
          {Object.entries(MODES).map(([key, val]) => (
            <button
              key={key}
              className={`mode-btn ${mode === key ? 'active' : ''}`}
              onClick={() => setMode(key)}
            >
              <span className="mode-icon">{val.icon}</span>
              {sidebarOpen && (
                <span className="mode-info">
                  <span className="mode-label">{val.label}</span>
                  <span className="mode-desc">{val.desc}</span>
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="clear-btn" onClick={clearChat}>
            🗑️ {sidebarOpen && 'Nouvelle conversation'}
          </button>
          <p className="powered-by">{sidebarOpen && 'Powered by Groq + Pollinations'}</p>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-info">
            <h1>Iris AI <span className="mode-badge">{MODES[mode].icon} {MODES[mode].label}</span></h1>
            <span className="status">● En ligne</span>
          </div>
        </header>

        <div className="messages-container">
          {messages.map(renderMessage)}
          {loading && (
            <div className="message-row assistant">
              <div className="avatar iris-avatar">🌸</div>
              <div className="bubble assistant-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                mode === 'image' ? '🎨 Décrivez l\'image à générer...' :
                mode === 'code' ? '💻 Décrivez votre problème de code...' :
                '💬 Écrivez votre message... (Entrée pour envoyer)'
              }
              rows={1}
            />
            <button
              className={`send-btn ${loading ? 'loading' : ''}`}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
          <p className="input-hint">Shift+Entrée pour nouvelle ligne</p>
        </div>
      </main>
    </div>
  );
}

export default App;
