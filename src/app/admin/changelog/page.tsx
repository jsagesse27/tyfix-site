import React from 'react';
import { History, Calendar, Target } from 'lucide-react';
import { changelogs } from './changelogData';

export const metadata = {
  title: 'Changelog | Admin Dashboard',
};

export default function ChangelogPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <History className="text-primary" /> Changelog & Reports
        </h1>
        <p className="text-gray-500">
          Real-time documentation of architectural upgrades, security patches, and feature deployments.
        </p>
      </div>

      <div className="space-y-12">
        {changelogs.map((log) => (
          <article key={log.id} className="admin-card space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <History size={120} />
            </div>

            {/* Header */}
            <div className="space-y-3 pb-6 border-b border-gray-100 relative z-10">
              <h2 className="text-2xl font-bold text-slate-900">{log.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full">
                  <Calendar size={14} /> {log.date}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                  <Target size={14} /> Prepared For: {log.target}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Executive Summary</h3>
              <p className="text-gray-600 leading-relaxed max-w-4xl whitespace-pre-line">{log.summary}</p>
            </div>

            {/* Sections */}
            <div className="space-y-8 relative z-10">
              {log.sections.map((section, sIdx) => (
                <section key={sIdx} className="space-y-4">
                  <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">{section.title}</h3>
                  <div className="grid gap-4">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                        <p className="font-medium text-gray-900 mb-3 leading-snug">
                          {item.action}
                        </p>
                        <div className="flex items-start gap-2 text-sm text-gray-600 italic bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          <span className="font-bold shrink-0 not-italic text-primary">In plain terms:</span>
                          <p>{item.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Conclusion */}
            {log.conclusion && (
              <div className="mt-8 pt-6 border-t border-gray-100 relative z-10 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Conclusion</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{log.conclusion}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
