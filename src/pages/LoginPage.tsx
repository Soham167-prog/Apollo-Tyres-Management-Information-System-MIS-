import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

/* ─── Inline SVG illustration – person working at desk ─── */
function DeskIllustration() {
  return (
    <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs">
      {/* Monitor */}
      <rect x="100" y="60" width="120" height="85" rx="6" fill="white" fillOpacity="0.18" />
      <rect x="106" y="66" width="108" height="72" rx="3" fill="white" fillOpacity="0.25" />
      {/* Screen content lines */}
      <rect x="114" y="74" width="55" height="6" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="114" y="84" width="40" height="4" rx="2" fill="white" fillOpacity="0.35" />
      <rect x="114" y="92" width="60" height="4" rx="2" fill="white" fillOpacity="0.35" />
      <rect x="114" y="100" width="48" height="4" rx="2" fill="white" fillOpacity="0.35" />
      {/* Bar chart inside screen */}
      <rect x="158" y="108" width="8" height="22" rx="1" fill="white" fillOpacity="0.55" />
      <rect x="170" y="102" width="8" height="28" rx="1" fill="white" fillOpacity="0.7" />
      <rect x="182" y="95" width="8" height="35" rx="1" fill="white" fillOpacity="0.55" />
      {/* Monitor stand */}
      <rect x="152" y="145" width="16" height="12" rx="2" fill="white" fillOpacity="0.2" />
      <rect x="140" y="156" width="40" height="5" rx="2" fill="white" fillOpacity="0.2" />
      {/* Desk surface */}
      <rect x="50" y="162" width="220" height="10" rx="3" fill="white" fillOpacity="0.25" />
      {/* Keyboard */}
      <rect x="118" y="172" width="84" height="14" rx="3" fill="white" fillOpacity="0.18" />
      {/* Chair back */}
      <rect x="56" y="108" width="32" height="48" rx="10" fill="white" fillOpacity="0.2" />
      {/* Person body */}
      <ellipse cx="72" cy="165" rx="14" ry="18" fill="white" fillOpacity="0.28" />
      {/* Head */}
      <circle cx="72" cy="100" r="14" fill="white" fillOpacity="0.35" />
      {/* Hair */}
      <path d="M59 98 Q65 88 80 90 Q86 96 84 98" fill="white" fillOpacity="0.4" />
      {/* Chair seat */}
      <rect x="50" y="155" width="44" height="8" rx="4" fill="white" fillOpacity="0.2" />
      {/* Chair legs */}
      <rect x="58" y="163" width="4" height="24" rx="2" fill="white" fillOpacity="0.18" />
      <rect x="82" y="163" width="4" height="24" rx="2" fill="white" fillOpacity="0.18" />
      <rect x="54" y="184" width="16" height="4" rx="2" fill="white" fillOpacity="0.18" />
      <rect x="74" y="184" width="16" height="4" rx="2" fill="white" fillOpacity="0.18" />
      {/* Arm reaching to keyboard */}
      <path d="M80 152 Q105 160 118 168" stroke="white" strokeOpacity="0.4" strokeWidth="5" strokeLinecap="round" />
      {/* Decorative circles (background dots) */}
      <circle cx="260" cy="55" r="22" fill="white" fillOpacity="0.08" />
      <circle cx="274" cy="220" r="30" fill="white" fillOpacity="0.07" />
      <circle cx="28" cy="220" r="18" fill="white" fillOpacity="0.07" />
      {/* Plant on desk */}
      <rect x="240" y="148" width="14" height="18" rx="3" fill="white" fillOpacity="0.2" />
      <ellipse cx="247" cy="145" rx="10" ry="12" fill="white" fillOpacity="0.28" />
      <path d="M240 140 Q237 128 244 126" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
      <path d="M254 138 Q260 127 256 122" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
      {/* Small document stack */}
      <rect x="208" y="155" width="24" height="6" rx="1" fill="white" fillOpacity="0.2" />
      <rect x="210" y="151" width="20" height="5" rx="1" fill="white" fillOpacity="0.15" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) setError('Invalid credentials. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-stretch" style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── LEFT: Blue illustration panel ── */}
      <div
        className="hidden md:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' }}
      >
        {/* Background decorative circles */}
        <div
          className="absolute rounded-full"
          style={{ width: 280, height: 280, background: 'rgba(255,255,255,0.06)', top: -60, left: -60 }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.06)', bottom: -40, right: -40 }}
        />

        {/* Illustration */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-10">
          <DeskIllustration />
          {/* Apollo Tyres logo + name below illustration */}
          <div className="flex items-center gap-3 mt-2">
            <img
              src="/apollo_tyres logo.jpg"
              alt="Apollo Tyres"
              className="h-9 w-auto object-contain rounded"
              style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 6px' }}
            />
            <div className="text-white">
              <p className="font-bold text-lg leading-tight">Apollo Tyres</p>
              <p className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.75)' }}>Management Information System</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form panel ── */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-8 relative"
        style={{ background: '#f8fafc', minWidth: 340 }}
      >
        {/* Bottom-right decorative arc */}
        <div
          className="absolute bottom-0 right-0 rounded-full pointer-events-none"
          style={{
            width: 180, height: 180,
            border: '28px solid #ede9fe',
            transform: 'translate(50%, 50%)',
          }}
        />

        {/* Card */}
        <div
          className="w-full relative z-10"
          style={{ maxWidth: 340 }}
        >
          {/* Heading */}
          <h1
            className="font-bold mb-1"
            style={{ fontSize: 28, color: '#1e293b', letterSpacing: '-0.5px' }}
          >
            Hello!
          </h1>
          <p className="mb-8 text-sm" style={{ color: '#64748b' }}>
            Sign Up to Get Started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: '#94a3b8' }}
              />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition"
                style={{
                  border: '1.5px solid #ede9fe',
                  background: '#ffffff',
                  color: '#1e293b',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#7c3aed')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ede9fe')}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: '#94a3b8' }}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition"
                style={{
                  border: '1.5px solid #ede9fe',
                  background: '#ffffff',
                  color: '#1e293b',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#7c3aed')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ede9fe')}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Forgot password */}
          <p className="mt-5 text-center text-xs" style={{ color: '#7c3aed', cursor: 'pointer' }}>
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}
