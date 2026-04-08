'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Save,
  CheckCircle2,
  Bot,
  Sliders,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import type { BotSettings } from '@/lib/types';

/* ── Defaults (used for reset & initial seed) ──────────────── */
const DEFAULTS: Omit<BotSettings, 'id' | 'created_at' | 'updated_at'> = {
  bot_name: 'Ty',
  bot_personality:
    'Friendly, straight-talking car enthusiast who genuinely cares about helping people find the right car. Brooklyn through-and-through.',
  dealership_name: 'TyFix Used Cars',
  dealership_location: 'Coney Island, Brooklyn, NY 11224',
  payment_model: 'cash-only',
  price_range: 'Most cars under $7,500',
  greeting_message:
    "Hey! 👋 I'm Ty from TyFix Used Cars. Whether you're looking for a specific ride or just browsing, I got you. What's on your mind?",
  allow_price_negotiation: false,
  collect_leads: true,
  bot_enabled: true,
  system_prompt_override: null,
  banned_phrases:
    "Great question!, I'd be happy to help!, I understand your concern, That's a great question, At the end of the day, Absolutely!, No worries!, Perfect!, Let me know if you have any questions, Is there anything else I can help with?",
  appointment_nudges:
    'Want to swing by and see it? I can set it up.|Nothing beats seeing it up close — when works for you?|I could hold this one for you. Got time this week?|A quick test drive would tell you everything.|Come see it — worst case you get a free cup of coffee ☕|You gotta feel this car in person.',
  custom_instructions: null,
  temperature: 0.8,
  max_tokens: 300,
  frequency_penalty: 0.5,
  presence_penalty: 0.4,
};

/* ── Toggle Switch ─────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 w-full text-left group"
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-800 block">{label}</span>
        {description && <span className="text-xs text-gray-400 block mt-0.5">{description}</span>}
      </div>
      {checked ? (
        <ToggleRight size={32} className="text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
      ) : (
        <ToggleLeft size={32} className="text-gray-300 shrink-0 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}

/* ── Slider ────────────────────────────────────────────────── */
function SliderField({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg tabular-nums min-w-[50px] text-center">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <span className="text-xs text-gray-400">{max}</span>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function AdminBotPage() {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'simple' | 'advanced'>('simple');
  const [showPreview, setShowPreview] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('bot_settings').select('*').limit(1).single();
      if (data) setSettings(data as BotSettings);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase
      .from('bot_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', settings.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const u = <K extends keyof BotSettings>(field: K, value: BotSettings[K]) => {
    if (settings) setSettings({ ...settings, [field]: value });
  };

  const resetField = <K extends keyof BotSettings>(field: K) => {
    if (settings && field in DEFAULTS) {
      u(field, (DEFAULTS as Record<string, unknown>)[field as string] as BotSettings[K]);
    }
  };

  /* ── Build a preview of the generated prompt ─────────────── */
  const promptPreview = useMemo(() => {
    if (!settings) return '';
    if (settings.system_prompt_override) return settings.system_prompt_override;

    const parts: string[] = [];
    parts.push(`== IDENTITY ==`);
    parts.push(
      `You are ${settings.bot_name} — you work at ${settings.dealership_name} in ${settings.dealership_location}. ${settings.bot_personality}`
    );
    parts.push('');
    parts.push(`== YOUR GOAL ==`);
    parts.push(
      `Have a genuinely helpful conversation about cars that naturally leads to the customer wanting to visit the lot.`
    );
    parts.push('');
    parts.push(`== THE LOT ==`);
    parts.push(
      `- Payment: ${settings.payment_model === 'cash-only' ? 'Cash-only. No financing.' : settings.payment_model === 'financing' ? 'Financing available.' : 'Cash or financing.'}`
    );
    parts.push(`- ${settings.price_range}`);
    parts.push(`- Location: ${settings.dealership_location}`);

    if (settings.banned_phrases) {
      parts.push('');
      parts.push(`== BANNED PHRASES ==`);
      parts.push(settings.banned_phrases);
    }

    if (!settings.allow_price_negotiation) {
      parts.push('');
      parts.push(`== PRICING — HARD RULES ==`);
      parts.push(`- NEVER negotiate price over chat.`);
      parts.push(`- NEVER offer discounts, deals, or price modifications.`);
    }

    if (settings.appointment_nudges) {
      parts.push('');
      parts.push(`== APPOINTMENT NUDGES ==`);
      settings.appointment_nudges.split('|').forEach((n) => parts.push(`- "${n.trim()}"`));
    }

    if (settings.custom_instructions) {
      parts.push('');
      parts.push(`== CUSTOM INSTRUCTIONS ==`);
      parts.push(settings.custom_instructions);
    }

    parts.push('');
    parts.push(`[... + voice rules, objection handling, tools, anti-repetition, etc.]`);

    return parts.join('\n');
  }, [settings]);

  if (loading || !settings) return <div className="text-center text-gray-400 py-12">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm animate-fade-in">
          <CheckCircle2 size={16} /> Bot settings saved!
        </div>
      )}

      {/* Bot enabled banner */}
      {!settings.bot_enabled && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
          <AlertTriangle size={16} /> The AI bot is currently disabled. Visitors won&apos;t see the chat widget.
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab('simple')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'simple' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Bot size={16} /> Simple
        </button>
        <button
          onClick={() => setTab('advanced')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'advanced' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Sliders size={16} /> Advanced
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SIMPLE TAB                                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      {tab === 'simple' && (
        <>
          {/* Master toggle */}
          <div className="admin-card">
            <Toggle
              checked={settings.bot_enabled}
              onChange={(v) => u('bot_enabled', v)}
              label="AI Bot Enabled"
              description="Show the chat widget on your website"
            />
          </div>

          {/* Identity */}
          <div className="admin-card space-y-4">
            <h2 className="text-lg font-bold">Bot Identity</h2>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bot Name</label>
              <input
                className="input-field"
                value={settings.bot_name}
                onChange={(e) => u('bot_name', e.target.value)}
                placeholder="Ty"
              />
              <p className="text-xs text-gray-400 mt-1">The name your chatbot introduces itself as</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Personality</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={settings.bot_personality}
                onChange={(e) => u('bot_personality', e.target.value)}
                placeholder="Friendly, knowledgeable car expert..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Describe how the bot should act — its tone, attitude, and vibe
              </p>
            </div>
          </div>

          {/* Dealership Info */}
          <div className="admin-card space-y-4">
            <h2 className="text-lg font-bold">Dealership Info</h2>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dealership Name</label>
              <input
                className="input-field"
                value={settings.dealership_name}
                onChange={(e) => u('dealership_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
              <input
                className="input-field"
                value={settings.dealership_location}
                onChange={(e) => u('dealership_location', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Model</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pr-10"
                  value={settings.payment_model}
                  onChange={(e) => u('payment_model', e.target.value as BotSettings['payment_model'])}
                >
                  <option value="cash-only">Cash Only</option>
                  <option value="financing">Financing Available</option>
                  <option value="both">Cash & Financing</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Range</label>
              <input
                className="input-field"
                value={settings.price_range}
                onChange={(e) => u('price_range', e.target.value)}
                placeholder="Most cars under $7,500"
              />
            </div>
          </div>

          {/* Greeting */}
          <div className="admin-card space-y-4">
            <h2 className="text-lg font-bold">Welcome Message</h2>
            <div>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={settings.greeting_message}
                onChange={(e) => u('greeting_message', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                The first message visitors see when they open the chat window
              </p>
            </div>
            <button
              onClick={() => resetField('greeting_message')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw size={12} /> Reset to default
            </button>
          </div>

          {/* Behavior Toggles */}
          <div className="admin-card space-y-5">
            <h2 className="text-lg font-bold">Behavior</h2>
            <Toggle
              checked={settings.collect_leads}
              onChange={(v) => u('collect_leads', v)}
              label="Collect Leads"
              description="Automatically capture customer name, phone, and interests during conversation"
            />
            <div className="border-t border-gray-100" />
            <Toggle
              checked={settings.allow_price_negotiation}
              onChange={(v) => u('allow_price_negotiation', v)}
              label="Allow Price Discussion"
              description="When OFF, the bot refuses to negotiate pricing and redirects to an in-person visit"
            />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ADVANCED TAB                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      {tab === 'advanced' && (
        <>
          {/* System Prompt Override */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">System Prompt Override</h2>
              {settings.system_prompt_override && (
                <button
                  onClick={() => u('system_prompt_override', null)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                >
                  <RotateCcw size={12} /> Clear override
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              If set, this <strong>replaces the entire generated prompt</strong>. Leave empty to use the auto-generated
              prompt based on your Simple settings. Only use this if you know what you&apos;re doing.
            </p>
            <textarea
              className="input-field resize-none font-mono text-xs leading-relaxed"
              rows={12}
              value={settings.system_prompt_override || ''}
              onChange={(e) => u('system_prompt_override', e.target.value || null)}
              placeholder="Leave empty to use auto-generated prompt..."
            />
            {settings.system_prompt_override && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-lg text-xs border border-amber-200">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Override active — Simple settings will be <strong>ignored</strong> for prompt generation.</span>
              </div>
            )}
          </div>

          {/* Custom Instructions */}
          <div className="admin-card space-y-4">
            <h2 className="text-lg font-bold">Custom Instructions</h2>
            <p className="text-xs text-gray-400">
              Extra instructions appended to the end of the auto-generated prompt. Use this to add specific rules or
              behaviors without overriding everything.
            </p>
            <textarea
              className="input-field resize-none"
              rows={5}
              value={settings.custom_instructions || ''}
              onChange={(e) => u('custom_instructions', e.target.value || null)}
              placeholder='e.g. "Always mention our free coffee when suggesting a visit" or "If they mention rideshare, highlight fuel efficiency"'
            />
          </div>

          {/* Banned Phrases */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Banned Phrases</h2>
              <button
                onClick={() => resetField('banned_phrases')}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Comma-separated list of phrases the bot should never use. These prevent generic &quot;chatbot speak.&quot;
            </p>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={settings.banned_phrases}
              onChange={(e) => u('banned_phrases', e.target.value)}
            />
          </div>

          {/* Appointment Nudges */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Appointment Nudges</h2>
              <button
                onClick={() => resetField('appointment_nudges')}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Pipe-separated (<code>|</code>) phrases the bot rotates through when suggesting a visit. It picks a
              different one each time to avoid repetition.
            </p>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={settings.appointment_nudges}
              onChange={(e) => u('appointment_nudges', e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {settings.appointment_nudges
                .split('|')
                .filter(Boolean)
                .map((nudge, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {nudge.trim()}
                  </span>
                ))}
            </div>
          </div>

          {/* Model Parameters */}
          <div className="admin-card space-y-6">
            <h2 className="text-lg font-bold">Model Parameters</h2>
            <SliderField
              label="Temperature"
              description="Higher = more creative/random. Lower = more focused/predictable."
              value={settings.temperature}
              onChange={(v) => u('temperature', v)}
              min={0}
              max={1}
              step={0.05}
            />
            <div className="border-t border-gray-100" />
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Max Tokens</label>
              <p className="text-xs text-gray-400 mt-0.5 mb-2">
                Maximum response length. 300 ≈ 2-3 sentences. Increase for longer answers.
              </p>
              <input
                type="number"
                className="input-field w-32"
                value={settings.max_tokens}
                onChange={(e) => u('max_tokens', parseInt(e.target.value) || 300)}
                min={50}
                max={1000}
              />
            </div>
            <div className="border-t border-gray-100" />
            <SliderField
              label="Frequency Penalty"
              description="Reduces word-level repetition. Higher = less repetition."
              value={settings.frequency_penalty}
              onChange={(v) => u('frequency_penalty', v)}
              min={0}
              max={1}
              step={0.05}
            />
            <div className="border-t border-gray-100" />
            <SliderField
              label="Presence Penalty"
              description="Encourages new topics. Higher = more varied conversation topics."
              value={settings.presence_penalty}
              onChange={(v) => u('presence_penalty', v)}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          {/* Prompt Preview */}
          <div className="admin-card space-y-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors w-full"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide' : 'Show'} Prompt Preview
            </button>
            {showPreview && (
              <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 whitespace-pre-wrap max-h-[400px] overflow-y-auto font-mono leading-relaxed">
                {promptPreview}
              </pre>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving} className="btn-admin">
        <Save size={16} /> {saving ? 'Saving...' : 'Save Bot Settings'}
      </button>
    </div>
  );
}
