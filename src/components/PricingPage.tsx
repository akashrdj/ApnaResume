import { Fragment, useEffect, useState } from 'react';
import { Check, Crown, Zap, ArrowLeft, Star, Sparkles, Infinity, Lock, FileText } from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
}

const FREE_FEATURES = [
  { text: '3 resume templates (Modern, Classic, Minimalist)', highlight: false },
  { text: 'Up to 3 saved resumes', highlight: false },
  { text: '5 AI chat messages per day', highlight: false },
  { text: '1 AI resume scan per week', highlight: false },
  { text: 'Basic formatting (Bold, Italic, Underline)', highlight: false },
  { text: 'PDF download', highlight: false },
  { text: 'Cloud auto-save', highlight: false },
];

const PRO_FEATURES = [
  { text: 'All 6 templates including 3 exclusive Pro designs', highlight: true },
  { text: 'Unlimited saved resumes', highlight: true },
  { text: 'Unlimited AI chat messages', highlight: true },
  { text: 'Unlimited AI resume scans with score', highlight: true },
  { text: 'Full formatting suite + font customization', highlight: false },
  { text: 'Priority Gemini AI — faster responses', highlight: false },
  { text: 'Advanced section reordering & custom sections', highlight: false },
  { text: 'Cover letter generator', highlight: false, soon: true },
  { text: 'LinkedIn profile import', highlight: false, soon: true },
  { text: 'Custom resume sharing link', highlight: false, soon: true },
  { text: 'Priority support', highlight: false },
];

type Feature = { text: string; highlight: boolean; soon?: boolean };

function FeatureRow({ feature, color }: { feature: Feature; color: 'green' | 'amber' }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <Check
        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}
      />
      <span className={feature.highlight ? 'text-white font-medium' : 'text-white/75'}>
        {feature.text}
        {feature.soon && (
          <span className="ml-2 text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full align-middle">
            soon
          </span>
        )}
      </span>
    </li>
  );
}

export default function PricingPage({ onBack }: PricingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [hoverFree, setHoverFree] = useState(false);
  const [hoverPro, setHoverPro] = useState(false);

  useEffect(() => {
    // Staggered mount animation
    requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
  }, []);

  return (
    <div
      className="min-h-screen overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.45s ease',
      }}
    >
      {/* ── Top nav ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-1.5 rounded-lg shadow-lg">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Resume Builder</span>
        </div>
        <div className="w-16" />
      </div>

      {/* ── Hero ── */}
      <div
        className="text-center pt-12 pb-14 px-4"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        }}
      >
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">Upgrade your plan</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Build resumes that<br />
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            get you hired
          </span>
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          Unlock Pro templates, unlimited AI scans, and powerful formatting tools.
        </p>
      </div>

      {/* ── Cards ── */}
      <div
        className="flex items-start justify-center gap-6 px-4 pb-16 flex-wrap max-w-4xl mx-auto"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.55s ease 0.2s, transform 0.55s ease 0.2s',
        }}
      >
        {/* ── FREE card ── */}
        <div
          className="flex-1 min-w-[300px] max-w-[380px]"
          onMouseEnter={() => setHoverFree(true)}
          onMouseLeave={() => setHoverFree(false)}
          style={{
            transform: hoverFree ? 'translateY(-10px)' : 'translateY(0)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div
            className="h-full rounded-2xl p-8 flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: hoverFree ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              boxShadow: hoverFree ? '0 24px 60px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div className="mb-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Starter</p>
              <h2 className="text-2xl font-bold text-white">Resume Builder Free</h2>
              <p className="text-white/50 text-sm mt-1">Everything you need to get started</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">₹0</span>
                <span className="text-white/40 text-sm ml-1">/month, forever</span>
              </div>
            </div>

            <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-4">What's included</p>
            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <FeatureRow key={f.text} feature={f} color="green" />
              ))}
            </ul>

            <button
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white/70 transition-all duration-200"
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                background: hoverFree ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* ── PRO card ── */}
        <div
          className="flex-1 min-w-[300px] max-w-[380px] relative"
          onMouseEnter={() => setHoverPro(true)}
          onMouseLeave={() => setHoverPro(false)}
          style={{
            transform: hoverPro ? 'translateY(-10px)' : 'translateY(0)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Outer glow */}
          <div
            className="absolute -inset-px rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f97316, #ec4899)',
              opacity: hoverPro ? 0.9 : 0.55,
              filter: hoverPro ? 'blur(12px)' : 'blur(18px)',
              transition: 'opacity 0.4s ease, filter 0.4s ease',
            }}
          />

          {/* "Most Popular" pill */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-1.5 rounded-full shadow-xl">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
            <span className="text-white text-xs font-bold tracking-wider uppercase">Most Popular</span>
          </div>

          <div
            className="relative h-full rounded-2xl p-8 flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #1e1b4b 0%, #1a1035 100%)',
              border: hoverPro ? '1px solid rgba(251,191,36,0.7)' : '1px solid rgba(251,191,36,0.35)',
              backdropFilter: 'blur(20px)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              boxShadow: hoverPro
                ? '0 32px 80px rgba(251,191,36,0.25), 0 8px 30px rgba(0,0,0,0.5)'
                : '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="mb-6 mt-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Pro</p>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Resume Builder Pro</h2>
              <p className="text-white/50 text-sm mt-1">Everything you need to land the job</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">₹299</span>
                <span className="text-white/40 text-sm ml-1">/month</span>
              </div>
              <p className="text-white/30 text-xs mt-1.5">
                or <span className="text-amber-400/70 font-medium">₹249/mo</span> billed annually — save 17%
              </p>
            </div>

            <div className="h-px mb-6" style={{ background: 'rgba(251,191,36,0.2)' }} />

            <p className="text-xs font-semibold text-amber-400/60 uppercase tracking-widest mb-4">
              Everything in Free, plus
            </p>
            <ul className="space-y-3 flex-1 mb-8">
              {PRO_FEATURES.map((f) => (
                <FeatureRow key={f.text} feature={f} color="amber" />
              ))}
            </ul>

            {/* Comparison callouts */}
            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
              {[
                { icon: <Infinity className="w-4 h-4 mx-auto mb-1 text-amber-400" />, label: 'AI Usage', sub: 'Unlimited' },
                { icon: <Crown className="w-4 h-4 mx-auto mb-1 text-amber-400" />, label: 'Templates', sub: 'All 6' },
                { icon: <Lock className="w-4 h-4 mx-auto mb-1 text-amber-400" />, label: 'Pro Designs', sub: 'Unlocked' },
              ].map(({ icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl py-2.5 px-1"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}
                >
                  {icon}
                  <p className="text-xs font-semibold text-white/70">{label}</p>
                  <p className="text-xs text-amber-400 font-bold">{sub}</p>
                </div>
              ))}
            </div>

            <button
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: hoverPro
                  ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
                  : 'linear-gradient(135deg, #f59e0b, #f97316)',
                boxShadow: hoverPro
                  ? '0 8px 30px rgba(245,158,11,0.5)'
                  : '0 4px 15px rgba(245,158,11,0.3)',
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <Zap className="w-4 h-4" />
              Get Pro — Coming Soon
            </button>

            <p className="text-center text-white/25 text-xs mt-3">
              Payment integration in progress. Stay tuned!
            </p>
          </div>
        </div>
      </div>

      {/* ── Feature comparison footer ── */}
      <div
        className="max-w-3xl mx-auto px-6 pb-20"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease 0.4s',
        }}
      >
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-widest text-center mb-5">
            Quick comparison
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-white/30 font-medium">Feature</div>
            <div className="text-center text-white/50 font-semibold">Free</div>
            <div className="text-center text-amber-400 font-semibold">Pro</div>

            {[
              ['Templates', '3', '6 (all)'],
              ['AI chat / day', '5 msgs', 'Unlimited'],
              ['AI resume scans', '1 / week', 'Unlimited'],
              ['Resume score', '✗', '✓'],
              ['Pro template designs', '✗', '✓'],
              ['Formatting styles', 'Basic', 'Full suite'],
              ['Saved resumes', 'Up to 3', 'Unlimited'],
            ].map(([feat, free, pro]) => (
              <Fragment key={feat}>
                <div className="text-white/60 py-2 border-t border-white/5">{feat}</div>
                <div className="text-center text-white/40 py-2 border-t border-white/5">{free}</div>
                <div
                  className={`text-center py-2 border-t border-white/5 font-medium ${pro === '\u2717' ? 'text-white/25' : 'text-amber-400'}`}
                >
                  {pro}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <p className="text-center text-white/20 text-xs mt-8">
          Payment integration coming soon. All Pro features are actively being developed.
        </p>
      </div>
    </div>
  );
}
