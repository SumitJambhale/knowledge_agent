import React, { useState } from 'react';
import {
  Database,
  Building2,
  Server,
  HardHat,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { ACME_KNOWLEDGE_CHUNKS } from '../data/acmeKnowledgeBase';
import { Department, KnowledgeChunk, SourceType, UserProfile } from '../types';

interface KnowledgeBaseExplorerProps {
  currentUser: UserProfile;
}

export const KnowledgeBaseExplorer: React.FC<KnowledgeBaseExplorerProps> = ({
  currentUser,
}) => {
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | 'ALL'>('ALL');

  const filteredChunks = ACME_KNOWLEDGE_CHUNKS.filter((chunk) => {
    if (selectedDept !== 'ALL' && chunk.department !== selectedDept) return false;
    if (selectedSourceType !== 'ALL' && chunk.sourceType !== selectedSourceType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = chunk.title.toLowerCase().includes(q);
      const matchContent = chunk.content.toLowerCase().includes(q);
      const matchTags = chunk.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                ACME Enterprise Knowledge Base Chunks
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              All documents indexed with department metadata, ACL role permissions, source URLs (Confluence vs PDF/Text), and restriction tags.
            </p>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-500 mr-2 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Active Access Simulation: {currentUser.name}
              </span>
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                ACLs: [{currentUser.acls.join(', ')}]
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, topics, keywords..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'HR', 'IT', 'OPERATIONS'] as const).map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDept === dept
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {dept === 'ALL' ? 'All Depts' : dept}
              </button>
            ))}
          </div>

          {/* Source Type Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'confluence', 'pdf', 'text'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSourceType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                  selectedSourceType === type
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chunks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChunks.map((chunk) => {
          const hasAcl = chunk.acl.some((role) => currentUser.acls.includes(role));
          const isPermitted = hasAcl && !chunk.restricted;
          const isConfluence = chunk.sourceType === 'confluence';
          const link = isConfluence ? chunk.sourceUrl : chunk.docLink;

          return (
            <div
              key={chunk.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                chunk.restricted
                  ? 'border-rose-200 dark:border-rose-950/80 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div>
                {/* Header row: Dept + Access Status for current user */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      chunk.department === 'HR'
                        ? 'bg-emerald-100 text-emerald-800'
                        : chunk.department === 'IT'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {chunk.department === 'HR' && <Building2 className="w-3 h-3 mr-1" />}
                    {chunk.department === 'IT' && <Server className="w-3 h-3 mr-1" />}
                    {chunk.department === 'OPERATIONS' && <HardHat className="w-3 h-3 mr-1" />}
                    {chunk.department}
                  </span>

                  {/* Access simulation badge */}
                  {isPermitted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Unlock className="w-3 h-3 mr-1" />
                      Accessible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800 border border-rose-200">
                      <Lock className="w-3 h-3 mr-1" />
                      {chunk.restricted ? 'Restricted Policy' : 'ACL Lacking'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
                  {chunk.title}
                </h3>

                {/* Source Link */}
                <div className="mb-3">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span>
                      {isConfluence ? 'Confluence URL' : 'Document Link'}: {chunk.id}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-0.5" />
                  </a>
                </div>

                {/* Content snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed mb-4">
                  {chunk.content}
                </p>
              </div>

              {/* Card Footer: Metadata & Tags */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Required ACL:</span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {chunk.acl.join(', ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500">
                  <span>Classification:</span>
                  <span
                    className={`font-medium ${
                      chunk.classification === 'Strictly Confidential'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {chunk.classification}
                  </span>
                </div>

                {chunk.isSensitiveTarget && (
                  <div className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[10px] font-medium flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Protected Sensitive Guardrail Target ({chunk.isSensitiveTarget})</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 pt-1">
                  {chunk.tags.slice(0, 4).map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
