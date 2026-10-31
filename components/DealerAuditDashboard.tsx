'use client'

import type { DealerAudit } from '@/lib/dealer-audit'

export default function DealerAuditDashboard({ audit }: { audit: DealerAudit }) {
  const metrics = [
    ['Listing Impressions', audit.totals.impressions], ['Property Views', audit.totals.views],
    ['VIP Tickets', audit.totals.vip_passes], ['Active Visit Passes', audit.totals.active_passes],
    ['Pending', audit.totals.pending], ['Visited', audit.totals.visited], ['Deal Closed', audit.totals.deal_closed],
  ] as const
  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      </div>)}
    </div>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-100 px-4 py-3 font-bold text-slate-800">Property Performance Audit</h2>
      {audit.properties.length ? <div className="overflow-x-auto"><table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500"><tr>{['Property', 'Impressions', 'Views', 'VIP Passes', 'Pending', 'Visited', 'Closed', 'Score'].map(x => <th key={x} className="whitespace-nowrap px-3 py-2">{x}</th>)}</tr></thead>
        <tbody>{audit.properties.map(p => <tr key={p.id} className="border-t border-slate-100">
          <td className="max-w-48 truncate px-3 py-3 font-medium text-slate-800">{p.title}</td><td className="px-3">{p.impressions}</td><td className="px-3">{p.views}</td><td className="px-3">{p.vip_passes}</td><td className="px-3">{p.pending}</td><td className="px-3">{p.visited}</td><td className="px-3">{p.deal_closed}</td><td className="px-3 font-bold text-orange-700">{p.audit_score}/100</td>
        </tr>)}</tbody>
      </table></div> : <p className="p-4 text-sm text-slate-500">No listings yet.</p>}
      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Score: listing details (40 points), visit requests per view (30), and visited/closed progress (30).</p>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-100 px-4 py-3 font-bold text-slate-800">Masked Lead Cards &amp; VIP Ticket Log</h2>
      {audit.leads.length ? <div className="divide-y divide-slate-100">{audit.leads.map(lead => <article key={lead.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-semibold text-slate-800">User #{lead.id.slice(-4).toUpperCase()} · {lead.phone_masked}</p>
          <p className="mt-1 text-xs text-slate-500">{lead.property_title || 'Property enquiry'} · {lead.purpose || 'Purpose not provided'} · {lead.urgency_timeline || 'Timeline not provided'}</p>
          {lead.pass_id && <p className="mt-1 font-mono text-xs text-orange-700">{lead.pass_id}{lead.visit_date ? ` · ${lead.visit_date}` : ''}</p>}
        </div><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{lead.status}</span>
      </article>)}</div> : <p className="p-4 text-sm text-slate-500">No buyer leads or VIP visit tickets yet.</p>}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-100 px-4 py-3 font-bold text-slate-800">Lead Status History</h2>
      {audit.status_history.length ? <ul className="divide-y divide-slate-100">{audit.status_history.map((item, i) => <li key={`${item.lead_id}-${item.changed_at}-${i}`} className="flex justify-between gap-3 px-4 py-3 text-xs">
        <span className="text-slate-700">Ticket {item.lead_id.slice(-6).toUpperCase()} → {item.status}</span><time className="shrink-0 text-slate-500">{new Date(item.changed_at).toLocaleString('en-IN')}</time>
      </li>)}</ul> : <p className="p-4 text-sm text-slate-500">Status changes will appear here.</p>}
    </section>
  </div>
}
