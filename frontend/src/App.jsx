import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/* ── Icons ── */
const Ic = {
  Plus:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Menu:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Chat:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Code:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Image:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Send:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Copy:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Check:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trash:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Download:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Zap:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Star:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Cpu:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
};

const IrisLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" fill="white" opacity="0.95"/>
    <circle cx="16" cy="16" r="9" fill="#c8ccd4"/>
    <circle cx="16" cy="16" r="5" fill="#3a3f4b"/>
    <circle cx="13" cy="13" r="2" fill="white" opacity="0.85"/>
    <circle cx="19" cy="19" r="1" fill="white" opacity="0.4"/>
  </svg>
);

/* ── Models ── */
const MODELS = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'Meta · Groq',
    desc: 'Rapide et polyvalent',
    tag: 'Recommandé',
    tagColor: '#19c37d',
    icon: '🦙',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    provider: 'Meta · Groq',
    desc: 'Ultra rapide, réponses courtes',
    tag: 'Rapide',
    tagColor: '#60a5fa',
    icon: '⚡',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'Mistral · Groq',
    desc: 'Excellent pour le code et le raisonnement',
    tag: 'Code',
    tagColor: '#c084fc',
    icon: '🔮',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    provider: 'Google · Groq',
    desc: 'Contexte long, tâches complexes',
    tag: 'Google',
    tagColor: '#f59e0b',
    icon: '💎',
  },
];

const MODES = {
  chat:  { label: 'Chat',  color: '#19c37d', icon: 'Chat' },
  code:  { label: 'Code',  color: '#60a5fa', icon: 'Code' },
  image: { label: 'Image', color: '#c084fc', icon: 'Image' },
};

const SUGGESTIONS = {
  chat:  ['Comment fonctionne une API REST ?', 'Explique-moi le machine learning', 'Quelles sont les meilleures pratiques web ?'],
  code:  ['Crée un serveur Express avec auth JWT', 'Écris un script Python pour scraper un site', 'Génère un composant React avec hooks'],
  image: ['Un paysage de montagne au lever du soleil', 'Une ville futuriste sous la pluie, cyberpunk', 'Un chat astronaute dans l\'espace'],
};

let cid = Date.now();

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [mode, setMode] = useState('chat');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const modelDropRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, imgLoading]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modelDropRef.current && !modelDropRef.current.contains(e.target)) {
        setModelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  const newConv = () => {
    const id = ++cid;
    setConversations(prev => [{ id, name: 'Nouvelle conversation', mode, model: selectedModel.id, messages: [] }, ...prev]);
    setActiveConvId(id);
    setInput('');
  };

  const deleteConv = (id, e) => {
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
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });
      setConversations(prev => prev.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, { role: 'assistant', type: 'image', url, prompt }] }
      ));
    } catch {
      setConversations(prev => prev.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, { role: 'assistant', type: 'text', content: 'Erreur lors de la génération d\'image. Réessayez.' }] }
      ));
    }
    setImgLoading(false);
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading || imgLoading) return;

    let convId = activeConvId;
    if (!convId) {
      const id = ++cid;
      const name = content.length > 45 ? content.slice(0, 42) + '...' : content;
      setConversations(prev => [{ id, name, mode, model: selectedModel.id, messages: [] }, ...prev]);
      setActiveConvId(id);
      convId = id;
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

    const history = (conversations.find(c => c.id === convId)?.messages || [])
      .filter(m => m.type === 'text')
      .map(m => ({ role: m.role, content: m.content }));
    const apiMessages = [...history, { role: 'user', content }];

    const systemPrompt = mode === 'code'
      ? `Tu es Iris, une IA experte en programmation. Modèle utilisé: ${selectedModel.name}. Tu fournis du code de qualité production, bien commenté, avec gestion d'erreurs. Tu expliques toujours ton code. Tu maîtrises JavaScript, TypeScript, Python, React, Node.js, SQL, Bash, et plus. Tu vérifies la logique de ton code avant de répondre.`
      : `Tu es Iris, une assistante IA intelligente et précise. Modèle utilisé: ${selectedModel.name}. Tu réponds en français. Tu es directe, précise et utile.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode, systemPrompt, model: selectedModel.id })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', responseText = '';
      const aMsg = { role: 'assistant', type: 'text', content: '' };

      setConversations(prev => prev.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, aMsg] }
      ));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content || '';
            responseText += delta;
            setConversations(prev => prev.map(c => {
              if (c.id !== convId) return c;
              const msgs = [...c.messages];
              msgs[msgs.length - 1] = { ...aMsg, content: responseText };
              return { ...c, messages: msgs };
            }));
          } catch {}
        }
      }
    } catch {
      setConversations(prev => prev.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, { role: 'assistant', type: 'text', content: 'Erreur de connexion au serveur.' }] }
      ));
    }
    setLoading(false);
    textareaRef.current?.focus();
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderMsg = (msg, i) => {
    if (msg.role === 'user') return (
      <div key={i} className="msg user">
        <div className="msg-inner"><div className="user-bubble">{msg.content}</div></div>
      </div>
    );

    if (msg.type === 'image') return (
      <div key={i} className="msg assistant">
        <div className="msg-inner">
          <div className="ai-avatar"><IrisLogo size={28}/></div>
          <div className="ai-body">
            <p className="img-label">"{msg.prompt}"</p>
            <div className="img-wrap">
              <img src={msg.url} alt={msg.prompt} className="gen-img" loading="lazy"/>
              <a href={msg.url} download="iris.jpg" className="img-dl"><Ic.Download/></a>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div key={i} className="msg assistant">
        <div className="msg-inner">
          <div className="ai-avatar"><IrisLogo size={28}/></div>
          <div className="ai-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                const key = `${i}-${match?.[1]}-${code.length}`;
                return !inline && match ? (
                  <div className="code-block">
                    <div className="code-head">
                      <div className="code-head-l">
                        <span className="dot r"/><span className="dot y"/><span className="dot g"/>
                        <span className="code-lang">{match[1]}</span>
                      </div>
                      <button className="copy-btn" onClick={() => copyCode(code, key)}>
                        {copiedIdx === key ? <><Ic.Check/> Copié</> : <><Ic.Copy/> Copier</>}
                      </button>
                    </div>
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, background: '#0d0d0d' }} {...props}>
                      {code}
                    </SyntaxHighlighter>
                  </div>
                ) : <code className="icode" {...props}>{children}</code>;
              }
            }}>{msg.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  const modeColor = MODES[mode].color;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? '' : ' closed'}`}>
        <div className="sb-top">
          <div className="sb-logo">
            <IrisLogo size={24}/>
            <span>Iris AI</span>
          </div>
          <button className="sb-new-btn" onClick={newConv} title="Nouvelle conversation">
            <Ic.Plus/>
          </button>
        </div>

        <div className="sb-section-label">Conversations</div>

        <div className="conv-list">
          {conversations.length === 0 && <p className="conv-empty">Aucune conversation</p>}
          {conversations.map(conv => (
            <div key={conv.id}
              className={`conv-item${conv.id === activeConvId ? ' active' : ''}`}
              onClick={() => { setActiveConvId(conv.id); setMode(conv.mode); }}>
              <span className="conv-dot" style={{ background: MODES[conv.mode]?.color }}/>
              <span className="conv-name">{conv.name}</span>
              <button className="conv-del" onClick={e => deleteConv(conv.id, e)}>
                <Ic.Trash/>
              </button>
            </div>
          ))}
        </div>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">G</div>
            <div className="sb-user-info">
              <span className="sb-username">gabter38</span>
              <span className="sb-plan">Plan gratuit</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main" style={{ '--mc': modeColor }}>
        {/* Topbar */}
        <div className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)}>
            <Ic.Menu/>
          </button>

          {/* Model selector */}
          <div className="model-sel" ref={modelDropRef}>
            <button className="model-btn" onClick={() => setModelOpen(o => !o)}>
              <span className="model-icon">{selectedModel.icon}</span>
              <span className="model-name">{selectedModel.name}</span>
              <span className={`model-chevron${modelOpen ? ' open' : ''}`}><Ic.ChevronDown/></span>
            </button>

            {modelOpen && (
              <div className="model-dropdown">
                <div className="model-drop-header">Choisir un modèle</div>
                {MODELS.map(m => (
                  <div key={m.id}
                    className={`model-opt${selectedModel.id === m.id ? ' active' : ''}`}
                    onClick={() => { setSelectedModel(m); setModelOpen(false); }}>
                    <div className="model-opt-icon">{m.icon}</div>
                    <div className="model-opt-info">
                      <div className="model-opt-top">
                        <span className="model-opt-name">{m.name}</span>
                        <span className="model-opt-tag" style={{ background: m.tagColor + '22', color: m.tagColor }}>{m.tag}</span>
                      </div>
                      <div className="model-opt-sub">
                        <span className="model-opt-provider">{m.provider}</span>
                        <span className="model-opt-desc"> · {m.desc}</span>
                      </div>
                    </div>
                    {selectedModel.id === m.id && <span className="model-opt-check"><Ic.Check/></span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mode tabs */}
          <div className="mode-tabs">
            {Object.entries(MODES).map(([key, val]) => {
              const Icon = Ic[val.icon];
              return (
                <button key={key}
                  className={`mode-tab${mode === key ? ' active' : ''}`}
                  style={mode === key ? { color: val.color, borderColor: val.color + '50', background: val.color + '18' } : {}}
                  onClick={() => setMode(key)}>
                  <Icon/>
                  {val.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages or Welcome */}
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-logo"><IrisLogo size={56}/></div>
            <h1>Bonjour, je suis <span style={{ color: modeColor }}>Iris</span></h1>
            <p className="welcome-sub">
              {selectedModel.icon} {selectedModel.name} · Mode <strong style={{ color: modeColor }}>{MODES[mode].label}</strong>
            </p>
            <div className="suggestions">
              {SUGGESTIONS[mode].map((s, i) => (
                <button key={i} className="sugg-btn" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map(renderMsg)}
            {(loading || imgLoading) && (
              <div className="msg assistant">
                <div className="msg-inner">
                  <div className="ai-avatar"><IrisLogo size={28}/></div>
                  <div className="ai-body">
                    {imgLoading
                      ? <div className="img-loading"><div className="spinner"/><span>Génération d'image en cours...</span></div>
                      : <div className="typing"><span/><span/><span/></div>}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
        )}

        {/* Input */}
        <div className="input-zone">
          <div className="input-box">
            <textarea ref={textareaRef} className="chat-input" value={input} rows={1}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKey}
              placeholder={mode === 'image' ? "Décrivez l'image à générer..." : mode === 'code' ? 'Décrivez votre problème de code...' : 'Écrivez un message...'}
            />
            <div className="input-foot">
              <span className="input-model-hint">
                {selectedModel.icon} {selectedModel.name}
              </span>
              <button className="send-btn"
                onClick={() => sendMessage()}
                disabled={loading || imgLoading || !input.trim()}
                style={input.trim() && !loading && !imgLoading ? { background: modeColor, color: '#111', borderColor: modeColor } : {}}>
                <Ic.Send/>
              </button>
            </div>
          </div>
          <p className="input-hint">Entrée pour envoyer · Shift+Entrée pour aller à la ligne</p>
        </div>
      </main>
    </div>
  );
}
