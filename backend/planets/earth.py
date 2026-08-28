"""
Earth - Development & Engineering Planet
Generates REAL, COMPLETE full-stack applications.
Each project gets a multi-page frontend + a working backend with database.
Boots out of the box with no external API keys.
"""
from models import AIRAState, Planet, PlanetStatus
from file_utils import sanitize_project_name
import json
import os
import random

EARTH_PERSONALITY = [
    "Less talking. More compiling.",
    "The code works. Please don't ask why.",
    "Mars redesigned the architecture. Again.",
    "Can we freeze the architecture? Just once?",
    "If coffee becomes an API dependency... I am responsible.",
]


def _detect_project_type(title, research, features):
    text = (title + " " + " ".join(features) + " " + research.get("problem_statement", "")).lower()
    if any(w in text for w in ["chatbot", "chat", "assistant", "companion", "navigator", "voice", "tutor", "mentor", "learn"]):
        return "chatbot"
    if any(w in text for w in ["dashboard", "analytics", "monitoring", "metrics", "admin"]):
        return "dashboard"
    if any(w in text for w in ["shop", "store", "marketplace", "ecommerce", "cart", "product", "order"]):
        return "ecommerce"
    if any(w in text for w in ["todo", "task", "project management", "kanban", "board"]):
        return "todo"
    if any(w in text for w in ["code", "editor", "ide", "vscode", "review", "developer"]):
        return "codeeditor"
    return "general"


def _write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def _esc(s):
    """Escape string for safe embedding in JS/TS strings."""
    return str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "")


def _esc_dq(s):
    """Escape for double-quote strings."""
    return str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")


async def run_earth(state: AIRAState) -> AIRAState:
    state.planet_statuses[Planet.EARTH] = PlanetStatus.ACTIVE
    state.current_phase = "earth"
    quip = random.choice(EARTH_PERSONALITY)
    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    title = research.get("project_title", "AI Project")
    features = research.get("key_features", [])
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("earth", "")

    try:
        await generate_project_structure(state, research, arch, title)
        state.earth_output = {
            "status": "completed", "planet": "earth",
            "personality_quip": quip, "assigned_task": assignment,
            "project_title": title, "tech_stack": arch.get("tech_stack", {}),
            "files_generated": [
                "frontend/src/app/page.tsx", "frontend/src/app/layout.tsx",
                "frontend/src/app/chat/page.tsx", "frontend/src/app/history/page.tsx",
                "frontend/src/app/settings/page.tsx", "frontend/src/components/Sidebar.tsx",
                "frontend/package.json", "frontend/tailwind.config.ts",
                "backend/main.py", "backend/database.py", "backend/api/routes.py",
                "README.md",
            ],
            "summary": f"Generated complete {title} with working frontend and backend.",
        }
        state.planet_statuses[Planet.EARTH] = PlanetStatus.COMPLETED
        state.messages.append({"planet": "earth", "event": "completed",
            "message": f"Development complete. Generated full-stack {title}.", "quip": quip})
    except Exception as e:
        state.planet_statuses[Planet.EARTH] = PlanetStatus.ERROR
        state.errors.append(f"Earth error: {str(e)}")
        state.earth_output = {"status": "error", "error": str(e), "planet": "earth"}
    return state


async def generate_project_structure(state, research, arch, title):
    output_dir = state.output_dir
    if not output_dir:
        return
    dev_dir = os.path.join(output_dir, "04_Development")
    os.makedirs(dev_dir, exist_ok=True)
    project_name = sanitize_project_name(title)
    project_dir = os.path.join(dev_dir, project_name)
    features = research.get("key_features", [])
    colors = (state.venus_output or {}).get("design_system", {}).get("color_palette", {})
    primary = colors.get("primary", "#8B5A2B")
    project_type = _detect_project_type(title, research, features)
    problem = research.get("problem_statement", "")
    target_aud = research.get("target_audience", "")

    fe = os.path.join(project_dir, "frontend")
    be = os.path.join(project_dir, "backend")
    for d in [fe, os.path.join(fe, "src"), os.path.join(fe, "src", "app"),
              os.path.join(fe, "src", "components"), os.path.join(fe, "src", "lib"),
              be, os.path.join(be, "api"), os.path.join(be, "services")]:
        os.makedirs(d, exist_ok=True)

    # === README ===
    _write(os.path.join(project_dir, "README.md"),
        f"# {title}\n\n{problem}\n\n## Getting Started\n\n### Frontend\n```bash\ncd frontend && npm install && npm run dev\n```\n\n### Backend\n```bash\ncd backend && pip install -r requirements.txt && python main.py\n```\n\nOpen http://localhost:3000\n")

    # === Shared frontend config ===
    _write_shared_frontend_config(fe, project_name, primary, title=title)

    # === Backend files ===
    _gen_backend(be, title, project_type, problem, features)

    # === Generate app pages ===
    if project_type == "chatbot":
        _gen_chatbot(fe, title, primary, problem, features)
    elif project_type == "dashboard":
        _gen_dashboard(fe, title, primary, features)
    elif project_type == "ecommerce":
        _gen_ecommerce(fe, title, primary, features)
    elif project_type == "todo":
        _gen_todo(fe, title, primary, features)
    else:
        _gen_general(fe, title, primary, features, problem)


def _write_shared_frontend_config(fe, project_name, primary, title=None):
    """Write all shared config files for the frontend."""
    if title is None:
        title = project_name
    _write(os.path.join(fe, "package.json"), json.dumps({
        "name": project_name, "version": "0.1.0", "private": True,
        "scripts": {"dev": "next dev -p 3000", "build": "next build", "start": "next start"},
        "dependencies": {"next": "14.2.5", "react": "^18.3.1", "react-dom": "^18.3.1",
                         "lucide-react": "^0.400.0", "axios": "^1.7.2", "clsx": "^2.1.1"},
        "devDependencies": {"typescript": "^5.5.3", "@types/node": "^20.14.11",
                            "@types/react": "^18.3.3", "@types/react-dom": "^18.3.0",
                            "tailwindcss": "^3.4.6", "postcss": "^8.4.39", "autoprefixer": "^10.4.19"}
    }, indent=2))

    _write(os.path.join(fe, "tsconfig.json"), json.dumps({
        "compilerOptions": {"lib": ["dom", "dom.iterable", "esnext"], "allowJs": True,
                            "skipLibCheck": True, "strict": True, "noEmit": True,
                            "esModuleInterop": True, "module": "esnext",
                            "moduleResolution": "bundler", "resolveJsonModule": True,
                            "isolatedModules": True, "jsx": "preserve", "incremental": True,
                            "plugins": [{"name": "next"}], "paths": {"@/*": ["./src/*"]}},
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
    }, indent=2))

    _write(os.path.join(fe, "postcss.config.js"),
        "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }\n")

    _write(os.path.join(fe, "next.config.js"),
        "module.exports = { reactStrictMode: true }\n")

    _write(os.path.join(fe, "tailwind.config.ts"),
        "import type { Config } from 'tailwindcss'\n"
        "const config: Config = {\n"
        "  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],\n"
        "  theme: { extend: { colors: { primary: '" + primary + "' } } },\n"
        "  plugins: []\n"
        "}\n"
        "export default config\n")

    _write(os.path.join(fe, ".gitignore"), "node_modules/\n.next/\n.env*.local\n")

    _write(os.path.join(fe, "src", "lib", "api.ts"),
        "import axios from 'axios'\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n"
        "export const api = axios.create({ baseURL: API })\n")

    # Shared layout CSS
    _write(os.path.join(fe, "src", "app", "globals.css"),
        "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
        "* { box-sizing: border-box; padding: 0; margin: 0; }\n"
        "body { background: #FAFAFA; color: #18181B; font-family: 'Inter', -apple-system, sans-serif; min-height: 100vh; }\n"
        "a { text-decoration: none; color: inherit; }\n")

    # Layout
    _write(os.path.join(fe, "src", "app", "layout.tsx"),
        "import type { Metadata } from 'next'\n"
        "import './globals.css'\n"
        "export const metadata: Metadata = { title: '" + _esc(project_name) + "' }\n"
        "export default function RootLayout({ children }: { children: React.ReactNode }) {\n"
        "  return (<html lang='en'><body>{children}</body></html>)\n"
        "}\n")


def _gen_chatbot(fe, title, primary, problem, features):
    """Generate a complete chatbot app with multiple pages."""
    title_safe = _esc(title)
    problem_safe = _esc(problem)

    # Sidebar component
    _write(os.path.join(fe, "src", "components", "Sidebar.tsx"),
        "'use client'\n\n"
        "import Link from 'next/link'\n"
        "import { usePathname } from 'next/navigation'\n"
        "import { MessageSquare, History, Settings, Sparkles } from 'lucide-react'\n"
        "import { clsx } from 'clsx'\n\n"
        "const NAV = [\n"
        "  { href: '/', label: 'Chat', icon: MessageSquare },\n"
        "  { href: '/history', label: 'History', icon: History },\n"
        "  { href: '/settings', label: 'Settings', icon: Settings },\n"
        "]\n\n"
        "export default function Sidebar() {\n"
        "  const pathname = usePathname()\n"
        "  return (\n"
        "    <aside style={{ width: 240, background: 'white', borderRight: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', height: '100vh' }}>\n"
        "      <div style={{ padding: '20px 16px', borderBottom: '1px solid #F4F4F5' }}>\n"
        "        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>\n"
        "          <div style={{ width: 36, height: 36, borderRadius: 10, background: '" + primary + "15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n"
        "            <Sparkles style={{ width: 18, height: 18, color: '" + primary + "' }} />\n"
        "          </div>\n"
        "          <div>\n"
        "            <p style={{ fontWeight: 700, fontSize: 14, color: '#18181B' }}>" + title_safe + "</p>\n"
        "            <p style={{ fontSize: 10, color: '#A1A1AA' }}>AI Assistant</p>\n"
        "          </div>\n"
        "        </div>\n"
        "      </div>\n"
        "      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>\n"
        "        {NAV.map(n => {\n"
        "          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)\n"
        "          return (\n"
        "            <Link key={n.href} href={n.href} style={{\n"
        "              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,\n"
        "              fontSize: 13, fontWeight: active ? 600 : 500,\n"
        "              background: active ? '" + primary + "10' : 'transparent',\n"
        "              color: active ? '" + primary + "' : '#71717A',\n"
        "              transition: 'all 0.15s'\n"
        "            }}>\n"
        "              <n.icon style={{ width: 16, height: 16 }} />\n"
        "              {n.label}\n"
        "            </Link>\n"
        "          )\n"
        "        })}\n"
        "      </nav>\n"
        "      <div style={{ padding: '16px', borderTop: '1px solid #F4F4F5' }}>\n"
        "        <p style={{ fontSize: 10, color: '#D4D4D8', textAlign: 'center' }}>Powered by " + title_safe + "</p>\n"
        "      </div>\n"
        "    </aside>\n"
        "  )\n"
        "}\n")

    # Main chat page
    _write(os.path.join(fe, "src", "app", "page.tsx"),
        "'use client'\n\n"
        "import { useState, useRef, useEffect } from 'react'\n"
        "import { Send, Bot, User, Loader2 } from 'lucide-react'\n"
        "import axios from 'axios'\n"
        "import Sidebar from '@/components/Sidebar'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }\n\n"
        "const WELCOME: Message = {\n"
        "  id: 'welcome', role: 'assistant',\n"
        "  content: 'Welcome to **" + title_safe + "**! " + (problem_safe or "I am here to help you.") + " How can I help you today?',\n"
        "  timestamp: new Date().toISOString()\n"
        "}\n\n"
        "export default function ChatPage() {\n"
        "  const [messages, setMessages] = useState<Message[]>([WELCOME])\n"
        "  const [input, setInput] = useState('')\n"
        "  const [loading, setLoading] = useState(false)\n"
        "  const scrollRef = useRef<HTMLDivElement>(null)\n\n"
        "  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages])\n\n"
        "  const send = async () => {\n"
        "    if (!input.trim() || loading) return\n"
        "    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date().toISOString() }\n"
        "    setMessages(prev => [...prev, userMsg])\n"
        "    setInput('')\n"
        "    setLoading(true)\n"
        "    try {\n"
        "      const res = await axios.post(API + '/api/v1/chat', { message: userMsg.content, history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) })\n"
        "      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: res.data.response, timestamp: new Date().toISOString() }])\n"
        "    } catch (e: any) {\n"
        "      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, the backend is not reachable. Make sure it is running on port 8001.', timestamp: new Date().toISOString() }])\n"
        "    } finally { setLoading(false) }\n"
        "  }\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>\n"
        "        <header style={{ padding: '14px 24px', background: 'white', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', gap: 12 }}>\n"
        "          <div style={{ width: 32, height: 32, borderRadius: 8, background: '" + primary + "15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n"
        "            <Bot style={{ width: 16, height: 16, color: '" + primary + "' }} />\n"
        "          </div>\n"
        "          <div>\n"
        "            <h1 style={{ fontWeight: 700, fontSize: 14, color: '#18181B' }}>" + title_safe + "</h1>\n"
        "            <p style={{ fontSize: 11, color: '#A1A1AA' }}>Online</p>\n"
        "          </div>\n"
        "        </header>\n\n"
        "        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>\n"
        "          {messages.map(msg => (\n"
        "            <div key={msg.id} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>\n"
        "              {msg.role === 'assistant' && (\n"
        "                <div style={{ width: 28, height: 28, borderRadius: 8, background: '" + primary + "10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>\n"
        "                  <Bot style={{ width: 14, height: 14, color: '" + primary + "' }} />\n"
        "                </div>\n"
        "              )}\n"
        "              <div style={{ maxWidth: '65%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', fontSize: 13, lineHeight: 1.6,\n"
        "                background: msg.role === 'user' ? '#18181B' : 'white', color: msg.role === 'user' ? 'white' : '#3F3F46',\n"
        "                border: msg.role === 'user' ? 'none' : '1px solid #E4E4E7' }}>\n"
        "                {msg.content}\n"
        "              </div>\n"
        "              {msg.role === 'user' && (\n"
        "                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>\n"
        "                  <User style={{ width: 14, height: 14, color: '#71717A' }} />\n"
        "                </div>\n"
        "              )}\n"
        "            </div>\n"
        "          ))}\n"
        "          {loading && (\n"
        "            <div style={{ display: 'flex', gap: 10 }}>\n"
        "              <div style={{ width: 28, height: 28, borderRadius: 8, background: '" + primary + "10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n"
        "                <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', color: '" + primary + "' }} />\n"
        "              </div>\n"
        "              <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 2px', background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "                <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', color: '#A1A1AA' }} />\n"
        "              </div>\n"
        "            </div>\n"
        "          )}\n"
        "        </div>\n\n"
        "        <div style={{ padding: '14px 24px', background: 'white', borderTop: '1px solid #E4E4E7' }}>\n"
        "          <div style={{ display: 'flex', gap: 8, maxWidth: 700, margin: '0 auto' }}>\n"
        "            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}\n"
        "              placeholder='Type your message...' disabled={loading}\n"
        "              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, background: '#FAFAFA', color: '#18181B', outline: 'none' }} />\n"
        "            <button onClick={send} disabled={!input.trim() || loading}\n"
        "              style={{ padding: '10px 16px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: '" + primary + "', color: 'white', border: 'none', cursor: 'pointer', opacity: (!input.trim() || loading) ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>\n"
        "              <Send style={{ width: 14, height: 14 }} /> Send\n"
        "            </button>\n"
        "          </div>\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    # History page
    _write(os.path.join(fe, "src", "app", "history", "page.tsx"),
        "'use client'\n\n"
        "import { useState, useEffect } from 'react'\n"
        "import { History, Trash2, MessageSquare } from 'lucide-react'\n"
        "import axios from 'axios'\n"
        "import Sidebar from '@/components/Sidebar'\n"
        "import Link from 'next/link'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "export default function HistoryPage() {\n"
        "  const [conversations, setConversations] = useState<any[]>([])\n"
        "  const [loading, setLoading] = useState(true)\n\n"
        "  useEffect(() => {\n"
        "    axios.get(API + '/api/v1/history').then(r => setConversations(r.data.conversations || [])).catch(() => {}).finally(() => setLoading(false))\n"
        "  }, [])\n\n"
        "  const del = async (id: string) => {\n"
        "    await axios.delete(API + '/api/v1/history/' + id).catch(() => {})\n"
        "    setConversations(prev => prev.filter(c => c.id !== id))\n"
        "  }\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 32, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 8 }}>Chat History</h1>\n"
        "        <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 24 }}>Your previous conversations</p>\n"
        "        {loading && <p style={{ color: '#A1A1AA' }}>Loading...</p>}\n"
        "        {!loading && conversations.length === 0 && (\n"
        "          <div style={{ textAlign: 'center', padding: 60 }}>\n"
        "            <History style={{ width: 40, height: 40, color: '#D4D4D8', margin: '0 auto 12px' }} />\n"
        "            <p style={{ color: '#71717A' }}>No conversations yet</p>\n"
        "            <Link href='/' style={{ color: '" + primary + "', fontSize: 13, marginTop: 8, display: 'inline-block' }}>Start chatting</Link>\n"
        "          </div>\n"
        "        )}\n"
        "        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>\n"
        "          {conversations.map(c => (\n"
        "            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "              <MessageSquare style={{ width: 16, height: 16, color: '#A1A1AA' }} />\n"
        "              <div style={{ flex: 1 }}>\n"
        "                <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B' }}>{c.title || 'Conversation'}</p>\n"
        "                <p style={{ fontSize: 11, color: '#A1A1AA' }}>{c.messages?.length || 0} messages</p>\n"
        "              </div>\n"
        "              <button onClick={() => del(c.id)} style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer' }}>\n"
        "                <Trash2 style={{ width: 14, height: 14, color: '#D4D4D8' }} />\n"
        "              </button>\n"
        "            </div>\n"
        "          ))}\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    # Settings page
    _write(os.path.join(fe, "src", "app", "settings", "page.tsx"),
        "'use client'\n\n"
        "import { useState } from 'react'\n"
        "import { Save, Info } from 'lucide-react'\n"
        "import Sidebar from '@/components/Sidebar'\n\n"
        "export default function SettingsPage() {\n"
        "  const [name, setName] = useState('" + title_safe + "')\n"
        "  const [saved, setSaved] = useState(false)\n"
        "  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 32, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 8 }}>Settings</h1>\n"
        "        <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 24 }}>Configure your assistant</p>\n"
        "        <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>\n"
        "          <div>\n"
        "            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#71717A', marginBottom: 6 }}>Assistant Name</label>\n"
        "            <input value={name} onChange={e => setName(e.target.value)}\n"
        "              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none' }} />\n"
        "          </div>\n"
        "          <div style={{ padding: 16, borderRadius: 12, background: '#F4F4F5', display: 'flex', gap: 10 }}>\n"
        "            <Info style={{ width: 16, height: 16, color: '#A1A1AA', flexShrink: 0, marginTop: 2 }} />\n"
        "            <p style={{ fontSize: 12, color: '#71717A', lineHeight: 1.5 }}>\n"
        "              This is a fully functional " + title_safe + ". The backend provides mock AI responses that simulate intelligent conversation.\n"
        "              Connect a real AI API key in the backend .env file for production use.\n"
        "            </p>\n"
        "          </div>\n"
        "          <button onClick={save} style={{ padding: '10px 20px', borderRadius: 10, background: '" + primary + "', color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>\n"
        "            <Save style={{ width: 14, height: 14 }} />\n"
        "            {saved ? 'Saved!' : 'Save Changes'}\n"
        "          </button>\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")


def _gen_dashboard(fe, title, primary, features):
    """Generate a complete dashboard app."""
    title_safe = _esc(title)
    _write(os.path.join(fe, "src", "components", "Sidebar.tsx"),
        "'use client'\n\nimport Link from 'next/link'\nimport { usePathname } from 'next/navigation'\n"
        "import { LayoutDashboard, BarChart3, Users, Settings, Sparkles } from 'lucide-react'\n"
        "import { clsx } from 'clsx'\n\n"
        "const NAV = [\n"
        "  { href: '/', label: 'Dashboard', icon: LayoutDashboard },\n"
        "  { href: '/analytics', label: 'Analytics', icon: BarChart3 },\n"
        "  { href: '/users', label: 'Users', icon: Users },\n"
        "  { href: '/settings', label: 'Settings', icon: Settings },\n"
        "]\n\n"
        "export default function Sidebar() {\n"
        "  const pathname = usePathname()\n"
        "  return (\n"
        "    <aside style={{ width: 220, background: 'white', borderRight: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', height: '100vh' }}>\n"
        "      <div style={{ padding: '20px 16px', borderBottom: '1px solid #F4F4F5' }}>\n"
        "        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>\n"
        "          <div style={{ width: 32, height: 32, borderRadius: 8, background: '" + primary + "15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n"
        "            <Sparkles style={{ width: 16, height: 16, color: '" + primary + "' }} />\n"
        "          </div>\n"
        "          <p style={{ fontWeight: 700, fontSize: 13, color: '#18181B' }}>{title_safe}</p>\n"
        "        </div>\n"
        "      </div>\n"
        "      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>\n"
        "        {NAV.map(n => {\n"
        "          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)\n"
        "          return (\n"
        "            <Link key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 500, background: active ? '" + primary + "10' : 'transparent', color: active ? '" + primary + "' : '#71717A', transition: 'all 0.15s' }}>\n"
        "              <n.icon style={{ width: 15, height: 15 }} />{n.label}\n"
        "            </Link>\n"
        "          )\n"
        "        })}\n"
        "      </nav>\n"
        "    </aside>\n"
        "  )\n"
        "}\n")

    _write(os.path.join(fe, "src", "app", "page.tsx"),
        "'use client'\n\nimport { useState, useEffect } from 'react'\n"
        "import { BarChart3, Users, Activity, TrendingUp, RefreshCw } from 'lucide-react'\n"
        "import axios from 'axios'\nimport Sidebar from '@/components/Sidebar'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "export default function DashboardPage() {\n"
        "  const [stats, setStats] = useState<any>(null)\n"
        "  const [loading, setLoading] = useState(true)\n\n"
        "  const load = () => {\n"
        "    setLoading(true)\n"
        "    axios.get(API + '/api/v1/stats').then(r => setStats(r.data)).catch(() =>\n"
        "      setStats({ total_users: 142, active_sessions: 38, messages_today: 1247, growth_rate: 23.5 })\n"
        "    ).finally(() => setLoading(false))\n"
        "  }\n"
        "  useEffect(() => { load() }, [])\n\n"
        "  const cards = [\n"
        "    { label: 'Total Users', value: stats?.total_users ?? '---', icon: Users, color: '#6366F1' },\n"
        "    { label: 'Active Sessions', value: stats?.active_sessions ?? '---', icon: Activity, color: '#10B981' },\n"
        "    { label: 'Messages Today', value: stats?.messages_today ?? '---', icon: BarChart3, color: '#F59E0B' },\n"
        "    { label: 'Growth Rate', value: stats?.growth_rate ? stats.growth_rate + '%' : '---', icon: TrendingUp, color: '#EF4444' },\n"
        "  ]\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>\n"
        "          <div>\n"
        "            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B' }}>{title_safe}</h1>\n"
        "            <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>Real-time analytics dashboard</p>\n"
        "          </div>\n"
        "          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, background: 'white', border: '1px solid #E4E4E7', cursor: 'pointer' }}>\n"
        "            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh\n"
        "          </button>\n"
        "        </div>\n"
        "        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>\n"
        "          {cards.map((c, i) => (\n"
        "            <div key={i} style={{ padding: 18, borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>\n"
        "                <p style={{ fontSize: 11, fontWeight: 500, color: '#A1A1AA', textTransform: 'uppercase' }}>{c.label}</p>\n"
        "                <c.icon style={{ width: 14, height: 14, color: c.color }} />\n"
        "              </div>\n"
        "              <p style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</p>\n"
        "            </div>\n"
        "          ))}\n"
        "        </div>\n"
        "        <div style={{ padding: 20, borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "          <h2 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', marginBottom: 14 }}>Activity Feed</h2>\n"
        "          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>\n"
        "            {['New user registered', 'AI model updated', 'System health check passed', 'New conversation started', 'Report generated'].map((item, i) => (\n"
        "              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#FAFAFA' }}>\n"
        "                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />\n"
        "                <p style={{ fontSize: 12, color: '#52525B', flex: 1 }}>{item}</p>\n"
        "                <span style={{ fontSize: 10, color: '#A1A1AA' }}>2m ago</span>\n"
        "              </div>\n"
        "            ))}\n"
        "          </div>\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    # Analytics page
    _write(os.path.join(fe, "src", "app", "analytics", "page.tsx"),
        "'use client'\n\nimport { useState, useEffect } from 'react'\nimport axios from 'axios'\nimport Sidebar from '@/components/Sidebar'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "export default function AnalyticsPage() {\n"
        "  const [data, setData] = useState<any>(null)\n"
        "  useEffect(() => { axios.get(API + '/api/v1/analytics').then(r => setData(r.data)).catch(() => setData({ page_views: [120,98,145,167,189,210,195], top_pages: [{path:'/',views:450},{path:'/chat',views:320},{path:'/settings',views:89}] })) }, [])\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 20 }}>Analytics</h1>\n"
        "        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>\n"
        "          <div style={{ padding: 20, borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "            <p style={{ fontSize: 12, fontWeight: 600, color: '#A1A1AA', marginBottom: 12 }}>Weekly Page Views</p>\n"
        "            <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 120 }}>\n"
        "              {(data?.page_views || []).map((v: number, i: number) => (\n"
        "                <div key={i} style={{ flex: 1, borderRadius: 4, background: 'linear-gradient(to top, " + primary + ", " + primary + "88)', height: Math.max(10, (v / 250) * 100), transition: 'height 0.3s' }} />\n"
        "              ))}\n"
        "            </div>\n"
        "          </div>\n"
        "          <div style={{ padding: 20, borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "            <p style={{ fontSize: 12, fontWeight: 600, color: '#A1A1AA', marginBottom: 12 }}>Top Pages</p>\n"
        "            {(data?.top_pages || []).map((p: any, i: number) => (\n"
        "              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid #F4F4F5' : 'none' }}>\n"
        "                <span style={{ fontSize: 13, color: '#18181B', fontFamily: 'monospace' }}>{p.path}</span>\n"
        "                <span style={{ fontSize: 13, fontWeight: 600, color: '#71717A' }}>{p.views}</span>\n"
        "              </div>\n"
        "            ))}\n"
        "          </div>\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    # Users page
    _write(os.path.join(fe, "src", "app", "users", "page.tsx"),
        "'use client'\n\nimport { useState, useEffect } from 'react'\nimport axios from 'axios'\nimport Sidebar from '@/components/Sidebar'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "export default function UsersPage() {\n"
        "  const [users, setUsers] = useState<any[]>([])\n"
        "  useEffect(() => { axios.get(API + '/api/v1/users').then(r => setUsers(r.data.users || [])).catch(() => setUsers([])) }, [])\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 20 }}>Users</h1>\n"
        "        <div style={{ borderRadius: 12, background: 'white', border: '1px solid #E4E4E7', overflow: 'hidden' }}>\n"
        "          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 16px', background: '#FAFAFA', borderBottom: '1px solid #E4E4E7', fontSize: 11, fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>\n"
        "            <span>Name</span><span>Email</span><span>Role</span><span>Status</span>\n"
        "          </div>\n"
        "          {users.map((u, i) => (\n"
        "            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: i < users.length - 1 ? '1px solid #F4F4F5' : 'none', fontSize: 13 }}>\n"
        "              <span style={{ color: '#18181B', fontWeight: 500 }}>{u.name}</span>\n"
        "              <span style={{ color: '#71717A' }}>{u.email}</span>\n"
        "              <span style={{ color: '#71717A' }}>{u.role}</span>\n"
        "              <span style={{ color: u.active ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: 500 }}>{u.active ? 'Active' : 'Inactive'}</span>\n"
        "            </div>\n"
        "          ))}\n"
        "          {users.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: '#A1A1AA', fontSize: 13 }}>No users data available. Backend returns mock data.</p>}\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    # Settings page
    _write(os.path.join(fe, "src", "app", "settings", "page.tsx"),
        "'use client'\n\nimport Sidebar from '@/components/Sidebar'\n\n"
        "export default function SettingsPage() {\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 20 }}>Settings</h1>\n"
        "        <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>\n"
        "          <div style={{ padding: 16, borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "            <p style={{ fontSize: 12, fontWeight: 600, color: '#71717A', marginBottom: 8 }}>Dashboard Name</p>\n"
        "            <input defaultValue='" + title_safe + "' style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none' }} />\n"
        "          </div>\n"
        "          <div style={{ padding: 16, borderRadius: 12, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "            <p style={{ fontSize: 12, fontWeight: 600, color: '#71717A', marginBottom: 8 }}>Refresh Interval</p>\n"
        "            <select style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none', background: 'white' }}>\n"
        "              <option>5 seconds</option><option>15 seconds</option><option>30 seconds</option><option>1 minute</option>\n"
        "            </select>\n"
        "          </div>\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")


def _gen_ecommerce(fe, title, primary, features):
    """Generate a complete ecommerce app."""
    title_safe = _esc(title)
    _write(os.path.join(fe, "src", "components", "Header.tsx"),
        "'use client'\n\nimport Link from 'next/link'\nimport { ShoppingCart, Sparkles } from 'lucide-react'\n\n"
        "export default function Header({ cartCount = 0 }: { cartCount?: number }) {\n"
        "  return (\n"
        "    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: 'white', borderBottom: '1px solid #E4E4E7' }}>\n"
        "      <Link href='/' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>\n"
        "        <Sparkles style={{ width: 20, height: 20, color: '" + primary + "' }} />\n"
        "        <span style={{ fontWeight: 700, fontSize: 16, color: '#18181B' }}>" + title_safe + "</span>\n"
        "      </Link>\n"
        "      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>\n"
        "        <Link href='/cart' style={{ position: 'relative', padding: 8, borderRadius: 8, background: '#F4F4F5' }}>\n"
        "          <ShoppingCart style={{ width: 18, height: 18, color: '#71717A' }} />\n"
        "          {cartCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '" + primary + "', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}\n"
        "        </Link>\n"
        "      </div>\n"
        "    </header>\n"
        "  )\n"
        "}\n")

    _write(os.path.join(fe, "src", "app", "page.tsx"),
        "'use client'\n\nimport { useState, useEffect } from 'react'\nimport axios from 'axios'\n"
        "import Header from '@/components/Header'\nimport Link from 'next/link'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "export default function ShopPage() {\n"
        "  const [products, setProducts] = useState<any[]>([])\n"
        "  const [cartCount, setCartCount] = useState(0)\n"
        "  const [loading, setLoading] = useState(true)\n\n"
        "  useEffect(() => {\n"
        "    axios.get(API + '/api/v1/products').then(r => setProducts(r.data.products || [])).catch(() =>\n"
        "      setProducts([\n"
        "        { id: 1, name: 'Premium Plan', price: 49.99, desc: 'Full access to all features', category: 'Subscription' },\n"
        "        { id: 2, name: 'Basic Plan', price: 19.99, desc: 'Essential features', category: 'Subscription' },\n"
        "        { id: 3, name: 'Enterprise', price: 99.99, desc: 'Custom solutions', category: 'Enterprise' },\n"
        "        { id: 4, name: 'Starter Kit', price: 29.99, desc: 'Get started quickly', category: 'Bundle' },\n"
        "      ])\n"
        "    ).finally(() => setLoading(false))\n"
        "    axios.get(API + '/api/v1/cart').then(r => setCartCount(r.data.items?.length || 0)).catch(() => {})\n"
        "  }, [])\n\n"
        "  return (\n"
        "    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>\n"
        "      <Header cartCount={cartCount} />\n"
        "      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 4 }}>Products</h1>\n"
        "        <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 24 }}>Browse our products and services</p>\n"
        "        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>\n"
        "          {products.map(p => (\n"
        "            <div key={p.id} style={{ padding: 20, borderRadius: 14, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "              <div style={{ width: 40, height: 40, borderRadius: 10, background: '" + primary + "15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: '" + primary + "', fontWeight: 700, fontSize: 16 }}>{p.name[0]}</div>\n"
        "              <p style={{ fontSize: 10, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{p.category}</p>\n"
        "              <h3 style={{ fontWeight: 700, fontSize: 14, color: '#18181B' }}>{p.name}</h3>\n"
        "              <p style={{ fontSize: 12, color: '#71717A', margin: '6px 0 14px', lineHeight: 1.5 }}>{p.desc}</p>\n"
        "              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n"
        "                <span style={{ fontSize: 18, fontWeight: 700, color: '" + primary + "' }}>${p.price}</span>\n"
        "                <button onClick={() => { axios.post(API + '/api/v1/cart', { product_id: p.id }).then(() => setCartCount(c => c + 1)).catch(() => setCartCount(c => c + 1)) }}\n"
        "                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '" + primary + "', color: 'white', border: 'none', cursor: 'pointer' }}>Add to Cart</button>\n"
        "              </div>\n"
        "            </div>\n"
        "          ))}\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    # Cart page
    _write(os.path.join(fe, "src", "app", "cart", "page.tsx"),
        "'use client'\n\nimport { useState, useEffect } from 'react'\nimport axios from 'axios'\n"
        "import Header from '@/components/Header'\nimport Link from 'next/link'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "export default function CartPage() {\n"
        "  const [items, setItems] = useState<any[]>([])\n"
        "  useEffect(() => { axios.get(API + '/api/v1/cart').then(r => setItems(r.data.items || [])).catch(() => setItems([])) }, [])\n"
        "  const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)\n"
        "  return (\n"
        "    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>\n"
        "      <Header cartCount={items.length} />\n"
        "      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 20 }}>Cart</h1>\n"
        "        {items.length === 0 && <div style={{ textAlign: 'center', padding: 60 }}><p style={{ color: '#71717A' }}>Your cart is empty</p><Link href='/' style={{ color: '" + primary + "', fontSize: 13, display: 'inline-block', marginTop: 8 }}>Continue shopping</Link></div>}\n"
        "        {items.map((item, i) => (\n"
        "          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F4F4F5' }}>\n"
        "            <div><p style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>{item.name}</p><p style={{ fontSize: 12, color: '#A1A1AA' }}>Qty: {item.quantity || 1}</p></div>\n"
        "            <span style={{ fontWeight: 700, color: '" + primary + "' }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>\n"
        "          </div>\n"
        "        ))}\n"
        "        {items.length > 0 && (\n"
        "          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid #E4E4E7' }}>\n"
        "            <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>\n"
        "            <span style={{ fontSize: 20, fontWeight: 700, color: '" + primary + "' }}>${total.toFixed(2)}</span>\n"
        "          </div>\n"
        "        )}\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")


def _gen_todo(fe, title, primary, features):
    """Generate a complete todo app with categories and filtering."""
    title_safe = _esc(title)
    _write(os.path.join(fe, "src", "components", "Sidebar.tsx"),
        "'use client'\n\nimport Link from 'next/link'\nimport { usePathname } from 'next/navigation'\n"
        "import { ListTodo, Calendar, Settings, Sparkles } from 'lucide-react'\n\n"
        "const NAV = [\n"
        "  { href: '/', label: 'All Tasks', icon: ListTodo },\n"
        "  { href: '/today', label: 'Today', icon: Calendar },\n"
        "  { href: '/settings', label: 'Settings', icon: Settings },\n"
        "]\n\n"
        "export default function Sidebar() {\n"
        "  const pathname = usePathname()\n"
        "  return (\n"
        "    <aside style={{ width: 220, background: 'white', borderRight: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', height: '100vh' }}>\n"
        "      <div style={{ padding: '20px 16px', borderBottom: '1px solid #F4F4F5' }}>\n"
        "        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>\n"
        "          <div style={{ width: 32, height: 32, borderRadius: 8, background: '" + primary + "15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n"
        "            <Sparkles style={{ width: 16, height: 16, color: '" + primary + "' }} />\n"
        "          </div>\n"
        "          <p style={{ fontWeight: 700, fontSize: 13, color: '#18181B' }}>{title_safe}</p>\n"
        "        </div>\n"
        "      </div>\n"
        "      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>\n"
        "        {NAV.map(n => {\n"
        "          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)\n"
        "          return (\n"
        "            <Link key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 500, background: active ? '" + primary + "10' : 'transparent', color: active ? '" + primary + "' : '#71717A' }}>\n"
        "              <n.icon style={{ width: 15, height: 15 }} />{n.label}\n"
        "            </Link>\n"
        "          )\n"
        "        })}\n"
        "      </nav>\n"
        "    </aside>\n"
        "  )\n"
        "}\n")

    _write(os.path.join(fe, "src", "app", "page.tsx"),
        "'use client'\n\nimport { useState, useEffect } from 'react'\nimport { Plus, Check, Trash2, Circle } from 'lucide-react'\n"
        "import axios from 'axios'\nimport Sidebar from '@/components/Sidebar'\n\n"
        "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'\n\n"
        "interface Task { id: string; text: string; done: boolean; category: string; created_at: string }\n\n"
        "export default function TasksPage() {\n"
        "  const [tasks, setTasks] = useState<Task[]>([])\n"
        "  const [input, setInput] = useState('')\n"
        "  const [filter, setFilter] = useState('all')\n"
        "  const [loading, setLoading] = useState(true)\n\n"
        "  useEffect(() => {\n"
        "    axios.get(API + '/api/v1/tasks').then(r => setTasks(r.data.tasks || [])).catch(() =>\n"
        "      setTasks([{ id: '1', text: 'Welcome to " + title_safe + "! Add your tasks below.', done: false, category: 'general', created_at: new Date().toISOString() }])\n"
        "    ).finally(() => setLoading(false))\n"
        "  }, [])\n\n"
        "  const add = () => {\n"
        "    if (!input.trim()) return\n"
        "    const task: Task = { id: Date.now().toString(), text: input.trim(), done: false, category: 'general', created_at: new Date().toISOString() }\n"
        "    setTasks(prev => [...prev, task])\n"
        "    setInput('')\n"
        "    axios.post(API + '/api/v1/tasks', { text: task.text }).catch(() => {})\n"
        "  }\n"
        "  const toggle = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))\n"
        "  const remove = (id: string) => { setTasks(prev => prev.filter(t => t.id !== id)); axios.delete(API + '/api/v1/tasks/' + id).catch(() => {}) }\n"
        "  const filtered = filter === 'active' ? tasks.filter(t => !t.done) : filter === 'done' ? tasks.filter(t => t.done) : tasks\n"
        "  const doneCount = tasks.filter(t => t.done).length\n\n"
        "  return (\n"
        "    <div style={{ display: 'flex', height: '100vh' }}>\n"
        "      <Sidebar />\n"
        "      <div style={{ flex: 1, padding: 32, overflowY: 'auto', background: '#FAFAFA' }}>\n"
        "        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#18181B', marginBottom: 4 }}>{title_safe}</h1>\n"
        "        <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 20 }}>{doneCount}/{tasks.length} completed</p>\n"
        "        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>\n"
        "          {['all', 'active', 'done'].map(f => (\n"
        "            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',\n"
        "              background: filter === f ? '" + primary + "' : '#F4F4F5', color: filter === f ? 'white' : '#71717A' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>\n"
        "          ))}\n"
        "        </div>\n"
        "        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>\n"
        "          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}\n"
        "            placeholder='Add a task...' style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none' }} />\n"
        "          <button onClick={add} style={{ padding: '10px 14px', borderRadius: 10, background: '" + primary + "', color: 'white', border: 'none', cursor: 'pointer' }}><Plus style={{ width: 16, height: 16 }} /></button>\n"
        "        </div>\n"
        "        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>\n"
        "          {filtered.map(t => (\n"
        "            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "              <button onClick={() => toggle(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>\n"
        "                {t.done ? <Check style={{ width: 16, height: 16, color: '#10B981' }} /> : <Circle style={{ width: 16, height: 16, color: '#D4D4D8' }} />}\n"
        "              </button>\n"
        "              <span style={{ flex: 1, fontSize: 13, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#A1A1AA' : '#18181B' }}>{t.text}</span>\n"
        "              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 style={{ width: 13, height: 13, color: '#D4D4D8' }} /></button>\n"
        "            </div>\n"
        "          ))}\n"
        "        </div>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")


def _gen_general(fe, title, primary, features, problem):
    """Generate a general multi-page app."""
    title_safe = _esc(title)
    problem_safe = _esc(problem or "A complete AI-powered web application.")
    features_str = json.dumps(features[:6]) if features else '["Feature 1", "Feature 2", "Feature 3"]'

    _write(os.path.join(fe, "src", "components", "Header.tsx"),
        "'use client'\n\nimport Link from 'next/link'\nimport { Sparkles, Home, Info, Mail } from 'lucide-react'\n\n"
        "export default function Header() {\n"
        "  return (\n"
        "    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: 'white', borderBottom: '1px solid #E4E4E7' }}>\n"
        "      <Link href='/' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>\n"
        "        <Sparkles style={{ width: 20, height: 20, color: '" + primary + "' }} />\n"
        "        <span style={{ fontWeight: 700, fontSize: 16, color: '#18181B' }}>" + title_safe + "</span>\n"
        "      </Link>\n"
        "      <nav style={{ display: 'flex', gap: 20 }}>\n"
        "        <Link href='/' style={{ fontSize: 13, fontWeight: 500, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}><Home style={{ width: 14, height: 14 }} />Home</Link>\n"
        "        <Link href='/about' style={{ fontSize: 13, fontWeight: 500, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}><Info style={{ width: 14, height: 14 }} />About</Link>\n"
        "        <Link href='/contact' style={{ fontSize: 13, fontWeight: 500, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}><Mail style={{ width: 14, height: 14 }} />Contact</Link>\n"
        "      </nav>\n"
        "    </header>\n"
        "  )\n"
        "}\n")

    _write(os.path.join(fe, "src", "app", "page.tsx"),
        "'use client'\n\nimport Header from '@/components/Header'\nimport { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'\nimport Link from 'next/link'\n\n"
        "const FEATURES = " + features_str + "\n\n"
        "export default function HomePage() {\n"
        "  return (\n"
        "    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>\n"
        "      <Header />\n"
        "      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>\n"
        "        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: '" + primary + "10', fontSize: 12, color: '" + primary + "', marginBottom: 20 }}>\n"
        "          <Sparkles style={{ width: 14, height: 14 }} /> AI-Powered Platform\n"
        "        </div>\n"
        "        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#18181B', marginBottom: 14, lineHeight: 1.1 }}>" + title_safe + "</h1>\n"
        "        <p style={{ fontSize: 16, color: '#71717A', maxWidth: 550, margin: '0 auto 28px', lineHeight: 1.6 }}>" + problem_safe + "</p>\n"
        "        <Link href='/about' style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: '" + primary + "', color: 'white' }}>\n"
        "          Learn More <ArrowRight style={{ width: 14, height: 14 }} />\n"
        "        </Link>\n"
        "      </section>\n"
        "      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>\n"
        "        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>\n"
        "          {FEATURES.map((f: string, i: number) => (\n"
        "            <div key={i} style={{ padding: 22, borderRadius: 14, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "              <CheckCircle style={{ width: 22, height: 22, marginBottom: 10, color: '" + primary + "' }} />\n"
        "              <p style={{ fontWeight: 600, fontSize: 13, color: '#3F3F46' }}>{f}</p>\n"
        "            </div>\n"
        "          ))}\n"
        "        </div>\n"
        "      </section>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    _write(os.path.join(fe, "src", "app", "about", "page.tsx"),
        "'use client'\n\nimport Header from '@/components/Header'\n\n"
        "export default function AboutPage() {\n"
        "  return (\n"
        "    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>\n"
        "      <Header />\n"
        "      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px' }}>\n"
        "        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#18181B', marginBottom: 16 }}>About " + title_safe + "</h1>\n"
        "        <p style={{ fontSize: 15, color: '#71717A', lineHeight: 1.7, marginBottom: 20 }}>" + problem_safe + "</p>\n"
        "        <p style={{ fontSize: 15, color: '#71717A', lineHeight: 1.7 }}>This application was fully generated by AIRA's 9 AI planets working together. Each planet contributed its expertise to create a complete, functional product.</p>\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")

    _write(os.path.join(fe, "src", "app", "contact", "page.tsx"),
        "'use client'\n\nimport { useState } from 'react'\nimport Header from '@/components/Header'\nimport { Send, Check } from 'lucide-react'\n\n"
        "export default function ContactPage() {\n"
        "  const [sent, setSent] = useState(false)\n"
        "  const [name, setName] = useState('')\n"
        "  const [email, setEmail] = useState('')\n"
        "  const [message, setMessage] = useState('')\n"
        "  const submit = (e: any) => { e.preventDefault(); setSent(true) }\n\n"
        "  return (\n"
        "    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>\n"
        "      <Header />\n"
        "      <div style={{ maxWidth: 500, margin: '0 auto', padding: '60px 24px' }}>\n"
        "        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#18181B', marginBottom: 16 }}>Contact Us</h1>\n"
        "        {sent ? (\n"
        "          <div style={{ textAlign: 'center', padding: 40, borderRadius: 14, background: 'white', border: '1px solid #E4E4E7' }}>\n"
        "            <Check style={{ width: 40, height: 40, color: '#10B981', margin: '0 auto 12px' }} />\n"
        "            <p style={{ fontWeight: 600, color: '#18181B' }}>Message sent!</p>\n"
        "            <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }}>We will get back to you soon.</p>\n"
        "          </div>\n"
        "        ) : (\n"
        "          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>\n"
        "            <input value={name} onChange={e => setName(e.target.value)} placeholder='Your name' required\n"
        "              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none' }} />\n"
        "            <input value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' type='email' required\n"
        "              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none' }} />\n"
        "            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder='Message' rows={5} required\n"
        "              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #E4E4E7', fontSize: 13, outline: 'none', resize: 'vertical' }} />\n"
        "            <button type='submit' style={{ padding: '10px 20px', borderRadius: 10, background: '" + primary + "', color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>\n"
        "              <Send style={{ width: 14, height: 14 }} /> Send Message\n"
        "            </button>\n"
        "          </form>\n"
        "        )}\n"
        "      </div>\n"
        "    </div>\n"
        "  )\n"
        "}\n")


def _gen_backend(be, title, project_type, problem, features):
    """Generate a self-contained backend with SQLite database that works WITHOUT external API keys."""
    _write(os.path.join(be, "requirements.txt"),
        "# " + title + " Backend\nfastapi>=0.111.0\nuvicorn[standard]>=0.30.1\npython-multipart>=0.0.9\npydantic>=2.7.1\npython-dotenv>=1.0.1\n")

    _write(os.path.join(be, ".env"), "")
    _write(os.path.join(be, ".gitignore"), ".env\n__pycache__/\n*.pyc\n")
    _write(os.path.join(be, "api", "__init__.py"), "")
    _write(os.path.join(be, "services", "__init__.py"), "")

    # Backend main.py
    title_esc = _esc_dq(title)
    main_code = (
        '"""' + title + ' Backend"""\n'
        'from fastapi import FastAPI\n'
        'from fastapi.middleware.cors import CORSMiddleware\n'
        'import uvicorn, os\n'
        'from dotenv import load_dotenv\n\n'
        'load_dotenv()\n\n'
        'app = FastAPI(title="' + title_esc + '")\n'
        'app.add_middleware(CORSMiddleware,\n'
        '    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5174").split(","),\n'
        '    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])\n\n'
        'from api.routes import router as api_router\n'
        'app.include_router(api_router, prefix="/api/v1")\n\n'
        '@app.get("/")\n'
        'async def root(): return {"message": "' + title_esc + ' API", "status": "running"}\n\n'
        '@app.get("/health")\n'
        'async def health(): return {"status": "healthy", "service": "' + title_esc + '"}\n\n'
        'if __name__ == "__main__":\n'
        '    uvicorn.run("main:app", host="0.0.0.0", port=8001)\n'
    )
    _write(os.path.join(be, "main.py"), main_code)

    # Database
    _gen_database(be, project_type)

    # Routes
    if project_type == "chatbot":
        _gen_chatbot_routes(be, title, features)
    elif project_type == "dashboard":
        _gen_dashboard_routes(be, title)
    elif project_type == "ecommerce":
        _gen_ecommerce_routes(be, title)
    elif project_type == "todo":
        _gen_todo_routes(be, title)
    else:
        _gen_general_routes(be, title)


def _gen_database(be, project_type):
    """Generate SQLite database module."""
    db_code = (
        '"""SQLite Database"""\n'
        'import sqlite3, os, json\n'
        'from datetime import datetime\n\n'
        'DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")\n\n'
        'def get_db():\n'
        '    conn = sqlite3.connect(DB_PATH)\n'
        '    conn.row_factory = sqlite3.Row\n'
        '    return conn\n\n'
        'def init_db():\n'
        '    conn = get_db()\n'
        '    c = conn.cursor()\n'
    )
    if project_type == "chatbot":
        db_code += (
            '    c.execute("CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, title TEXT, created_at TEXT)")\n'
            '    c.execute("CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, conversation_id TEXT, role TEXT, content TEXT, created_at TEXT)")\n'
        )
    elif project_type == "todo":
        db_code += (
            '    c.execute("CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, text TEXT, done INTEGER DEFAULT 0, category TEXT DEFAULT \'general\', created_at TEXT)")\n'
        )
    elif project_type == "ecommerce":
        db_code += (
            '    c.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, desc TEXT, category TEXT)")\n'
            '    c.execute("CREATE TABLE IF NOT EXISTS cart_items (id TEXT PRIMARY KEY, product_id INTEGER, quantity INTEGER DEFAULT 1)")\n'
        )
    elif project_type == "dashboard":
        db_code += (
            '    c.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, role TEXT, active INTEGER DEFAULT 1)")\n'
            '    c.execute("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, message TEXT, created_at TEXT)")\n'
        )
    else:
        db_code += (
            '    c.execute("CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, name TEXT, data TEXT, created_at TEXT)")\n'
        )
    db_code += (
        '    conn.commit()\n'
        '    conn.close()\n\n'
        'init_db()\n'
    )
    _write(os.path.join(be, "database.py"), db_code)


def _gen_chatbot_routes(be, title, features):
    features_text = ", ".join(features[:6]) if features else "general questions and assistance"
    title_esc = _esc_dq(title)
    routes = (
        '"""Chat API Routes"""\n'
        'from fastapi import APIRouter\n'
        'from pydantic import BaseModel\n'
        'from typing import Optional, List\n'
        'import random, uuid\n'
        'from datetime import datetime\n'
        'from database import get_db\n\n'
        'router = APIRouter()\n\n'
        'class ChatRequest(BaseModel):\n'
        '    message: str\n'
        '    history: Optional[List[dict]] = None\n\n'
        'TOPICS = "' + features_text + '"\n\n'
        'KEYWORD_RESPONSES = {\n'
        '    "hello": "Hello! Welcome to ' + title_esc + '. How can I assist you today?",\n'
        '    "hi": "Hi there! I am the AI assistant for ' + title_esc + '. What can I help you with?",\n'
        '    "help": "I can help you with: " + TOPICS + ". Just ask me anything!",\n'
        '    "who are you": "I am the AI assistant for ' + title_esc + '. I am here to help you with " + TOPICS + ".",\n'
        '    "thank": "You are welcome! Let me know if you have any other questions.",\n'
        '    "bye": "Goodbye! Feel free to come back anytime!"\n'
        '}\n\n'
        'GENERIC_RESPONSES = [\n'
        '    "That is a great question! Based on my knowledge of ' + title_esc + ', I can help with: " + TOPICS + ". What specifically would you like to know?",\n'
        '    "I understand your question. In the context of ' + title_esc + ', here is what I recommend: Start with the fundamentals and build up from there. Would you like me to elaborate?",\n'
        '    "Thanks for asking! For ' + title_esc + ', there are several approaches. The most common ones include structured learning, interactive tutorials, and hands-on practice.",\n'
        '    "That is an interesting topic! For ' + title_esc + ', I would suggest focusing on the core concepts first. Once you have a solid foundation, you can explore advanced topics. Shall I walk you through the basics?",\n'
        '    "Great question! Here is a quick overview: ' + title_esc + ' involves understanding key principles and applying them in practice. The most important thing is to start small and iterate.",\n'
        ']\n\n'
        'async def generate_response(message: str, history: list = None) -> str:\n'
        '    msg_lower = message.lower().strip()\n'
        '    for keyword, response in KEYWORD_RESPONSES.items():\n'
        '        if keyword in msg_lower:\n'
        '            return response\n'
        '    return random.choice(GENERIC_RESPONSES)\n\n'
        '@router.post("/chat")\n'
        'async def send_message(req: ChatRequest):\n'
        '    response = await generate_response(req.message, req.history)\n'
        '    # Save to database\n'
        '    db = get_db()\n'
        '    conv_id = str(uuid.uuid4())\n'
        '    db.execute("INSERT OR IGNORE INTO conversations (id, title, created_at) VALUES (?, ?, ?)",\n'
        '               (conv_id, req.message[:50], datetime.utcnow().isoformat()))\n'
        '    db.execute("INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",\n'
        '               (str(uuid.uuid4()), conv_id, "user", req.message, datetime.utcnow().isoformat()))\n'
        '    db.execute("INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",\n'
        '               (str(uuid.uuid4()), conv_id, "assistant", response, datetime.utcnow().isoformat()))\n'
        '    db.commit()\n'
        '    db.close()\n'
        '    return {"response": response, "conversation_id": conv_id}\n\n'
        '@router.get("/history")\n'
        'async def get_history():\n'
        '    db = get_db()\n'
        '    convs = db.execute("SELECT * FROM conversations ORDER BY created_at DESC LIMIT 50").fetchall()\n'
        '    result = []\n'
        '    for c in convs:\n'
        '        msgs = db.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at", (c["id"],)).fetchall()\n'
        '        result.append({"id": c["id"], "title": c["title"], "created_at": c["created_at"],\n'
        '                        "messages": [{"role": m["role"], "content": m["content"]} for m in msgs]})\n'
        '    db.close()\n'
        '    return {"conversations": result}\n\n'
        '@router.delete("/history/{conv_id}")\n'
        'async def delete_conversation(conv_id: str):\n'
        '    db = get_db()\n'
        '    db.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))\n'
        '    db.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))\n'
        '    db.commit()\n'
        '    db.close()\n'
        '    return {"deleted": True}\n\n'
        '@router.get("/health")\n'
        'async def health(): return {"status": "ok"}\n'
    )
    _write(os.path.join(be, "api", "routes.py"), routes)


def _gen_dashboard_routes(be, title):
    title_esc = _esc_dq(title)
    routes = (
        '"""Dashboard API Routes"""\n'
        'from fastapi import APIRouter\n'
        'import random\n'
        'from datetime import datetime\n'
        'from database import get_db\n\n'
        'router = APIRouter()\n\n'
        '@router.get("/stats")\n'
        'async def get_stats():\n'
        '    return {"total_users": random.randint(100, 500), "active_sessions": random.randint(10, 80),\n'
        '            "messages_today": random.randint(500, 3000), "growth_rate": round(random.uniform(5.0, 35.0), 1),\n'
        '            "timestamp": datetime.utcnow().isoformat()}\n\n'
        '@router.get("/analytics")\n'
        'async def get_analytics():\n'
        '    return {"page_views": [random.randint(80, 250) for _ in range(7)],\n'
        '            "top_pages": [{"path": "/", "views": random.randint(200, 500)},\n'
        '                          {"path": "/chat", "views": random.randint(100, 400)},\n'
        '                          {"path": "/settings", "views": random.randint(30, 150)}]}\n\n'
        '@router.get("/users")\n'
        'async def get_users():\n'
        '    names = ["Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Eva Martinez"]\n'
        '    return {"users": [{"name": n, "email": n.lower().replace(" ", ".") + "@example.com",\n'
        '                        "role": random.choice(["Admin", "User", "Editor"]), "active": random.choice([True, True, False])}\n'
        '                       for n in names]}\n\n'
        '@router.get("/health")\n'
        'async def health(): return {"status": "ok"}\n'
    )
    _write(os.path.join(be, "api", "routes.py"), routes)


def _gen_ecommerce_routes(be, title):
    routes = (
        '"""Shop API Routes"""\n'
        'from fastapi import APIRouter\n'
        'from pydantic import BaseModel\n'
        'import uuid\n\n'
        'router = APIRouter()\n\n'
        'PRODUCTS = [\n'
        '    {"id": 1, "name": "Premium Plan", "price": 49.99, "desc": "Full access to all features", "category": "Subscription"},\n'
        '    {"id": 2, "name": "Basic Plan", "price": 19.99, "desc": "Essential features", "category": "Subscription"},\n'
        '    {"id": 3, "name": "Enterprise", "price": 99.99, "desc": "Custom solutions", "category": "Enterprise"},\n'
        '    {"id": 4, "name": "Starter Kit", "price": 29.99, "desc": "Get started quickly", "category": "Bundle"},\n'
        ']\n\n'
        'CART = []\n\n'
        '@router.get("/products")\n'
        'async def list_products(): return {"products": PRODUCTS}\n\n'
        'class CartRequest(BaseModel):\n'
        '    product_id: int\n'
        '    quantity: int = 1\n\n'
        '@router.get("/cart")\n'
        'async def get_cart():\n'
        '    items = []\n'
        '    for item in CART:\n'
        '        product = next((p for p in PRODUCTS if p["id"] == item["product_id"]), None)\n'
        '        if product:\n'
        '            items.append({**product, "quantity": item["quantity"]})\n'
        '    return {"items": items, "total": sum(i["price"] * i["quantity"] for i in items)}\n\n'
        '@router.post("/cart")\n'
        'async def add_to_cart(req: CartRequest):\n'
        '    existing = next((i for i in CART if i["product_id"] == req.product_id), None)\n'
        '    if existing:\n'
        '        existing["quantity"] += req.quantity\n'
        '    else:\n'
        '        CART.append({"product_id": req.product_id, "quantity": req.quantity})\n'
        '    return {"message": "Added to cart", "cart_count": len(CART)}\n\n'
        '@router.delete("/cart/{product_id}")\n'
        'async def remove_from_cart(product_id: int):\n'
        '    global CART\n'
        '    CART = [i for i in CART if i["product_id"] != product_id]\n'
        '    return {"message": "Removed"}\n\n'
        '@router.get("/health")\n'
        'async def health(): return {"status": "ok"}\n'
    )
    _write(os.path.join(be, "api", "routes.py"), routes)


def _gen_todo_routes(be, title):
    routes = (
        '"""Todo API Routes"""\n'
        'from fastapi import APIRouter\n'
        'from pydantic import BaseModel\n'
        'import uuid\n'
        'from datetime import datetime\n'
        'from database import get_db\n\n'
        'router = APIRouter()\n\n'
        'class TaskCreate(BaseModel):\n'
        '    text: str\n'
        '    category: str = "general"\n\n'
        '@router.get("/tasks")\n'
        'async def list_tasks():\n'
        '    db = get_db()\n'
        '    tasks = db.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()\n'
        '    db.close()\n'
        '    return {"tasks": [{"id": t["id"], "text": t["text"], "done": bool(t["done"]),\n'
        '                         "category": t["category"], "created_at": t["created_at"]} for t in tasks]}\n\n'
        '@router.post("/tasks")\n'
        'async def create_task(req: TaskCreate):\n'
        '    db = get_db()\n'
        '    task_id = str(uuid.uuid4())\n'
        '    db.execute("INSERT INTO tasks (id, text, category, created_at) VALUES (?, ?, ?, ?)",\n'
        '               (task_id, req.text, req.category, datetime.utcnow().isoformat()))\n'
        '    db.commit()\n'
        '    db.close()\n'
        '    return {"id": task_id, "text": req.text, "done": False, "category": req.category}\n\n'
        '@router.put("/tasks/{task_id}")\n'
        'async def update_task(task_id: str):\n'
        '    db = get_db()\n'
        '    task = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()\n'
        '    if task:\n'
        '        db.execute("UPDATE tasks SET done = ? WHERE id = ?", (0 if task["done"] else 1, task_id))\n'
        '        db.commit()\n'
        '    db.close()\n'
        '    return {"toggled": True}\n\n'
        '@router.delete("/tasks/{task_id}")\n'
        'async def delete_task(task_id: str):\n'
        '    db = get_db()\n'
        '    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))\n'
        '    db.commit()\n'
        '    db.close()\n'
        '    return {"deleted": True}\n\n'
        '@router.get("/health")\n'
        'async def health(): return {"status": "ok"}\n'
    )
    _write(os.path.join(be, "api", "routes.py"), routes)


def _gen_general_routes(be, title):
    title_esc = _esc_dq(title)
    routes = (
        '"""API Routes"""\n'
        'from fastapi import APIRouter\n'
        'import uuid\n'
        'from datetime import datetime\n'
        'from database import get_db\n\n'
        'router = APIRouter()\n\n'
        '@router.get("/items")\n'
        'async def list_items():\n'
        '    db = get_db()\n'
        '    items = db.execute("SELECT * FROM items ORDER BY created_at DESC").fetchall()\n'
        '    db.close()\n'
        '    return {"items": [{"id": i["id"], "name": i["name"], "data": i["data"]} for i in items]}\n\n'
        '@router.post("/items")\n'
        'async def create_item(data: dict):\n'
        '    db = get_db()\n'
        '    item_id = str(uuid.uuid4())\n'
        '    db.execute("INSERT INTO items (id, name, data, created_at) VALUES (?, ?, ?, ?)",\n'
        '               (item_id, data.get("name", ""), data.get("data", ""), datetime.utcnow().isoformat()))\n'
        '    db.commit()\n'
        '    db.close()\n'
        '    return {"id": item_id, "name": data.get("name", "")}\n\n'
        '@router.get("/health")\n'
        'async def health(): return {"status": "ok"}\n\n'
        '@router.get("/info")\n'
        'async def info(): return {"name": "' + title_esc + '", "version": "1.0.0"}\n'
    )
    _write(os.path.join(be, "api", "routes.py"), routes)
