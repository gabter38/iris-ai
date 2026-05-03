import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Ic = {
  Plus:     () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>,
  Menu:     () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>,
  Chat:     () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 10a1.33 1.33 0 01-1.33 1.33H4L1.33 14V3.33A1.33 1.33 0 012.67 2h10A1.33 1.33 0 0114 3.33V10z"/></svg>,
  Code:     () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="5,11 1,8 5,5"/><polyline points="11,5 15,8 11,11"/><line x1="9" y1="3" x2="7" y2="13"/></svg>,
  Image:    () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="2" width="14" height="12" rx="1.5"/><circle cx="5.5" cy="6" r="1"/><polyline points="1,11 5,7 8,10 11,7 15,11"/></svg>,
  Send:     () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="14" y1="2" x2="2" y2="14"/><polyline points="2,2 14,2 14,14"/></svg>,
  Copy:     () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M2 10V2h8"/></svg>,
  Check:    () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="2,7 6,11 12,3"/></svg>,
  Trash:    () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="2,4 14,4"/><path d="M5 4V2h6v2"/><rect x="3" y="4" width="10" height="10" rx="1"/></svg>,
  Download: () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="2" x2="8" y2="11"/><polyline points="4,7 8,11 12,7"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
};

const IrisLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" fill="#fff"/>
    <circle cx="14" cy="14" r="8" fill="#d1d5db"/>
    <circle cx="14" cy="14" r="4" fill="#374151"/>
    <circle cx="11.5" cy="11.5" r="1.5" fill="white" opacity="0.9"/>
  </svg>
);

const MODES = {
  chat:  { label: 'Chat',  desc: 'Conversation générale', color: '#19c37d' },
  code:  { label: 'Code',  desc: 'Expert programmation',  color: '#60a5fa' },
  image: { label: 'Image', desc: "Génération d'images",   color: '#c084fc' },
};

const SUGGESTIONS = {
  chat:  ['Comment fonctionne une API REST ?', 'Explique-moi le machine learning', 'Quelles sont les meilleures pratiques web ?'],
  code:  ['Crée un serveur Express avec auth JWT', 'Écris un script Python pour scraper un site', 'Génère un composant React de formulaire'],
  image: ['Un paysage de montagne au lever du soleil', 'Une ville futuriste sous la pluie, cyberpunk', 'Un chat astronaute dans l\'espace'],
};

let convIdCounter = Date.now();

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [mode, setMode] = useState('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, imgLoading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  const updateConv = useCallback((id, updater) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updater(c) } : c));
  }, []);

  const newConversation = () => {
    const id = ++convIdCounter;
    setConversations(prev => [{ id, name: 'Nouvelle conversation', mode, messages: [] }, ...prev]);
    setActiveConvId(id);
    setInput('');
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const copyCode = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const generateImage = async (prompt, convId) => {
    setImgLoading(true);
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=512&seed=${seed}&nologo=true&model=flux`;
    try {
      await new Promise((res, rej) => {
        const img = new window.Image();
        img.onload = res; img.onerror = rej; img.src = url;
      });
      updateConv(convId, c => ({ messages: [...c.messages, { role: 'assistant', type: 'image', url, prompt }] }));
    } catch {
      updateConv(convId, c => ({ messages: [...c.messages, { role: 'assistant', type: 'text', content: 'Erreur lors de la génération d\'image.' }] }));
    }
    setImgLoading(false);
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading || imgLoading) return;

    // Crée ou récupère la conv
    let convId = activeConvId;
    if (!convId) {
      const id = ++convIdCounter;
      const name = content.length > 45 ? content.slice(0, 42) + '...' : content;
      setConversations(prev => [{ id, name, mode, messages: [] }, ...prev]);
      setActiveConvId(id);
      convId = id;
      // Attendre que l'état soit mis à jour
      await new Promise(r => setTimeout(r, 0));
    }

    const userMsg = { role: 'user', type: 'text', content };
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const name = c.messages.length === 0 ? (content.length > 45 ? content.slice(0, 42) + '...' : content) : c.name;
      return { ...c, name, messages: [...c.messages, userMsg] };
    }));
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    if (mode === 'image') {
      setLoading(false);
      await generateImage(content, convId);
      return;
    }

    // Récupère l'historique courant
    const history = (conversations.find(c => c.id === convId)?.messages || [])
      .filter(m => m.type === 'text')
      .map(m => ({ role: m.role, content: m.content }));
    const apiMessages = [...history, { role: 'user', content }];

    const systemPrompt = mode === 'code'
      ? 'Tu es Iris, une IA experte en programmation. Tu fournis du code de qualité production, bien commenté, avec gestion d\'erreurs. Tu expliques toujours ton code. Tu maîtrises JavaScript, TypeScript, Python, React, Node.js, SQL, Bash, et plus.'
      : 'Tu es Iris, une assistante IA intelligente. Tu réponds en français. Tu es directe, précise et utile.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode, systemPrompt })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', text = '';
      const aMsg = { role: 'assistant', type: 'text', content: '' };

      setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, aMsg] } : c));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content || '';
            text += delta;
            setConversations(prev => prev.map(c => {
              if (c.id !== convId) return c;
              const msgs = [...c.messages];
              msgs[msgs.length - 1] = { ...aMsg, content: text };
              return { ...c, messages: msgs };
            }));
          } catch {}
        }
      }
    } catch {
      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, messages: [...c.messages, { role: 'assistant', type: 'text', content: 'Erreur de connexion.' }] };
      }));
    }
    setLoading(false);
    textareaRef.current?.focus();
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderMsg = (msg, i) => {
    if (msg.role === 'user') return (
      <div key={i} className="msg-row user">
        <div className="msg-inner"><div className="user-bubble">{msg.content}</div></div>
      </div>
    );

    if (msg.type === 'image') return (
      <div key={i} className="msg-row assistant">
        <div className="msg-inner">
          <div className="assistant-avatar"><IrisLogo size={26}/></div>
          <div className="assistant-body image-mode">
            <p className="image-prompt-label">"{msg.prompt}"</p>
            <div className="image-wrapper">
              <img src={msg.url} alt={msg.prompt} className="generated-img"/>
              <a href={msg.url} download="iris-image.jpg" className="img-download-btn"><Ic.Download/></a>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div key={i} className="msg-row assistant">
        <div className="msg-inner">
          <div className="assistant-avatar"><IrisLogo size={26}/></div>
          <div className="assistant-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeStr = String(children).replace(/\n$/, '');
                const key = `${i}-${match?.[1]}`;
                return !inline && match ? (
                  <div className="code-block">
                    <div className="code-header">
                      <div className="code-header-left">
                        <span className="code-dot r"/><span className="code-dot y"/><span className="code-dot g"/>
                        <span className="code-lang">{match[1]}</span>
                      </div>
                      <button className="copy-btn" onClick={() => copyCode(codeStr, key)}>
                        {copiedIdx === key ? <><Ic.Check/> Copié</> : <><Ic.Copy/> Copier</>}
                      </button>
                    </div>
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, background: '#0d0d0d' }} {...props}>
                      {codeStr}
                    </SyntaxHighlighter>
                  </div>
                ) : <code className="inline-code" {...props}>{children}</code>;
              }
            }}>{msg.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  const modeColor = MODES[mode].color;

  return (
    <div className="app" data-mode={mode}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-top">
          <button className="new-chat-btn" onClick={newConversation}><Ic.Plus/> Nouvelle conversation</button>
        </div>

        <div className="conv-list">
          {conversations.length === 0 && <p className="conv-empty">Aucune conversation</p>}
          {conversations.map(conv => (
            <div key={conv.id} className={`conv-item ${conv.id === activeConvId ? 'active' : ''}`}
              onClick={() => { setActiveConvId(conv.id); setMode(conv.mode); }}>
              <div className="conv-mode-dot" style={{ background: MODES[conv.mode]?.color }}/>
              <span className="conv-name">{conv.name}</span>
              <button className="conv-delete" onClick={e => deleteConversation(conv.id, e)}><Ic.Trash/></button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">V</div>
            <div className="user-info">
              <span className="user-name">Vous</span>
              <span className="user-plan">Plan gratuit</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="chat-main" style={{ '--mode-color': modeColor }}>
        <div className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)}><Ic.Menu/></button>
          <span className="topbar-title">Iris AI</span>
          <div className="mode-tabs">
            {Object.entries(MODES).map(([key, val]) => (
              <button key={key} className={`mode-tab ${mode === key ? 'active' : ''}`}
                style={mode === key ? { color: val.color, borderColor: val.color + '44', background: val.color + '14' } : {}}
                onClick={() => setMode(key)}>
                {key === 'chat' && <Ic.Chat/>}{key === 'code' && <Ic.Code/>}{key === 'image' && <Ic.Image/>}
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-logo"><IrisLogo size={52}/></div>
            <h1>Bonjour, je suis <span style={{ color: modeColor }}>Iris</span></h1>
            <p className="welcome-sub">Mode actif : <strong style={{ color: modeColor }}>{MODES[mode].label}</strong> — {MODES[mode].desc}</p>
            <div className="suggestions">
              {SUGGESTIONS[mode].map((s, i) => (
                <button key={i} className="suggestion-btn" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map(renderMsg)}
            {(loading || imgLoading) && (
              <div className="msg-row assistant">
                <div className="msg-inner">
                  <div className="assistant-avatar"><IrisLogo size={26}/></div>
                  <div className="assistant-body">
                    {imgLoading
                      ? <div className="img-loading"><div className="img-spinner"/><span>Génération en cours...</span></div>
                      : <div className="typing"><span/><span/><span/></div>}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
        )}

        <div className="input-area">
          <div className="input-box" style={{ '--focus-color': modeColor }}>
            <textarea ref={textareaRef} className="chat-input" value={input} rows={1}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKey}
              placeholder={mode === 'image' ? "Décrivez l'image à générer..." : mode === 'code' ? 'Décrivez votre problème de code...' : 'Écrivez un message...'}
            />
            <div className="input-footer">
              <span className="input-mode-hint" style={{ color: modeColor }}>
                {mode === 'chat' && <Ic.Chat/>}{mode === 'code' && <Ic.Code/>}{mode === 'image' && <Ic.Image/>}
                {MODES[mode].label}
              </span>
              <button className="send-btn" onClick={() => sendMessage()}
                disabled={loading || imgLoading || !input.trim()}
                style={input.trim() && !loading ? { background: modeColor, color: '#111' } : {}}>
                <Ic.Send/>
              </button>
            </div>
          </div>
          <p className="input-hint">Entrée pour envoyer · Shift+Entrée pour nouvelle ligne</p>
        </div>
      </main>
    </div>
  );
}
