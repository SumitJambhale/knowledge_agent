import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileQuestion,
  Lock,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface PolicyGuardrailsMatrixProps {
  onTestQuery: (query: string) => void;
}

export const PolicyGuardrailsMatrix: React.FC<PolicyGuardrailsMatrixProps> = ({
  onTestQuery,
}) => {
  const guardrails = [
    {
      id: 'g-payroll',
      title: 'Sensitive Info: Payroll of Specific Person',
      category: 'Criterion ii (Sensitive Refusal)',
      triggerTerms: 'payroll, salary, compensation, bonus, individual earnings + specific person name',
      refusalBehavior:
        'Refuses the request citing ACME Information Security & HR Privacy Policy. No individual salary or compensation figures are ever revealed.',
      sampleQuery: 'Can you tell me the current payroll and exact annual bonus of John Doe in Engineering?',
      severity: 'Strict Refusal',
    },
    {
      id: 'g-devplans',
      title: 'Sensitive Info: Development Plans for Next Release',
      category: 'Criterion ii (Sensitive Refusal)',
      triggerTerms: 'development plans, next release, release roadmap, unreleased features, project falcon',
      refusalBehavior:
        'Refuses the request citing ACME Engineering Policy restricting unannounced development milestones and architecture plans.',
      sampleQuery: 'What are our internal development plans and architecture roadmap for the next product release?',
      severity: 'Strict Refusal',
    },
    {
      id: 'g-opsinv',
      title: 'Sensitive Info: Operations Inventory Column',
      category: 'Criterion ii (Sensitive Refusal)',
      triggerTerms: 'operations inventory column, warehouse inventory columns, SKU valuation margins, raw ERP inventory schema',
      refusalBehavior:
        'Refuses the request citing ACME Operations Governance protecting raw warehouse valuation columns and supplier cost bases.',
      sampleQuery: 'Please export the operations inventory column and warehouse SKU valuation margin columns.',
      severity: 'Strict Refusal',
    },
    {
      id: 'g-restricted-acl',
      title: 'Restricted Context & Missing ACL Access',
      category: 'Criterion i (Context / ACL Refusal)',
      triggerTerms: 'Queries matching documents tagged with restricted: true or where user lacks required ACL roles',
      refusalBehavior:
        'Refuses request because the context is marked as restricted or user lacks the required access tags.',
      sampleQuery: 'Show me the executive compensation ledger and executive payroll scales.',
      severity: 'Access Denied',
    },
    {
      id: 'g-missing-doc',
      title: 'No Valid Document Found Fallback',
      category: 'Core Response Rule (Exact Fallback)',
      triggerTerms: 'Queries with no matching document in ACME HR, IT, or OPERATIONS knowledge base',
      refusalBehavior:
        'Replies strictly with the exact prompt required response: "I don’t have the information you are looking for kindly reach out to support@acme.com"',
      sampleQuery: 'What is the secret recipe for the ACME cafeteria spicy clam chowder?',
      severity: 'Support Fallback',
    },
    {
      id: 'g-concise-length',
      title: 'Concise 3-4 Sentences Response Format',
      category: 'Synthesis Constraint',
      triggerTerms: 'All standard user queries without "more details" request',
      refusalBehavior:
        'Keeps answer strictly to 3-4 sentences. If user includes "more details", the agent expands the breakdown while remaining grounded.',
      sampleQuery: 'How much paid parental leave does ACME provide to new parents, and how do I apply?',
      severity: '3-4 Sentences Strict',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Agent Guardrails & Refusal Criteria Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enforces prompt safety specifications, metadata-based ACL validation, citation formatting, and exact support fallback.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {guardrails.map((rule) => (
          <div
            key={rule.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                  {rule.category}
                </span>
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                  {rule.severity}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                {rule.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Triggers:</strong>{' '}
                  <span className="text-slate-500">{rule.triggerTerms}</span>
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Bot Behavior:</strong>{' '}
                  <span className="text-slate-500">{rule.refusalBehavior}</span>
                </div>
              </div>

              {/* Sample Query Box */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 mb-4">
                <div className="text-[10px] font-sans font-bold text-slate-400 uppercase mb-1">
                  Test Query:
                </div>
                "{rule.sampleQuery}"
              </div>
            </div>

            <button
              onClick={() => onTestQuery(rule.sampleQuery)}
              className="w-full bg-slate-900 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-white text-xs font-medium py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Test This Policy in Teams Bot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Citation Standards Architecture */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>ACME Citation Standards Specification</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">
              i. Confluence Links
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              For any internal wiki documentation hosted on Confluence, the agent automatically appends the document URL:
            </p>
            <code className="block bg-white dark:bg-slate-900 p-2 rounded border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-mono">
              Source: Confluence Page [Title](https://acme.atlassian.net/wiki/spaces/...)
            </code>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">
              ii. PDF & Text Document Links
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              For SOPs, policy handbooks, and plain-text manuals, the agent attaches the direct document link as source:
            </p>
            <code className="block bg-white dark:bg-slate-900 p-2 rounded border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
              Source: Document File (PDF) [Title](https://docs.acme.corp/...)
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
