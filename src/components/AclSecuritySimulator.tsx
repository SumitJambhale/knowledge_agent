import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  Server,
  HardHat,
  ArrowRight,
} from 'lucide-react';
import { ACME_KNOWLEDGE_CHUNKS, ACME_USER_PROFILES } from '../data/acmeKnowledgeBase';
import { KnowledgeChunk, UserProfile } from '../types';

interface AclSecuritySimulatorProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
}

export const AclSecuritySimulator: React.FC<AclSecuritySimulatorProps> = ({
  currentUser,
  setCurrentUser,
}) => {
  const [selectedChunkId, setSelectedChunkId] = useState<string>(ACME_KNOWLEDGE_CHUNKS[0].id);

  const selectedChunk =
    ACME_KNOWLEDGE_CHUNKS.find((c) => c.id === selectedChunkId) || ACME_KNOWLEDGE_CHUNKS[0];

  const hasMatchingAcl = selectedChunk.acl.some((role) => currentUser.acls.includes(role));
  const isRestrictedByDoc = selectedChunk.restricted;
  const isAccessGranted = hasMatchingAcl && !isRestrictedByDoc;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Introduction Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ACL & Metadata Security Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verifies prompt requirement: <em>"Check for the Metadata attached with the chunk for the user access right based on ACL"</em> and <em>"If context is marked as restricted or missing refuse the request."</em>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Evaluation Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Persona Selection */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Select Test Persona
            </h3>
            <span className="text-[11px] text-indigo-500 font-medium">5 Roles</span>
          </div>

          <div className="space-y-2">
            {ACME_USER_PROFILES.map((user) => {
              const isSelected = currentUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setCurrentUser(user)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center space-x-3 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                        {user.department}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user.role}</div>
                    <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      ACLs: [{user.acls.join(', ')}]
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Chunk Selection */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Select Knowledge Chunk
            </h3>
            <span className="text-[11px] text-indigo-500 font-medium">{ACME_KNOWLEDGE_CHUNKS.length} Documents</span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {ACME_KNOWLEDGE_CHUNKS.map((chunk) => {
              const isSelected = selectedChunk.id === chunk.id;
              return (
                <button
                  key={chunk.id}
                  onClick={() => setSelectedChunkId(chunk.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 font-medium text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{chunk.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded uppercase ${
                        chunk.restricted ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {chunk.restricted ? 'RESTRICTED' : chunk.classification}
                    </span>
                  </div>
                  <div className="font-semibold truncate">{chunk.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                    <span>Dept: {chunk.department}</span>
                    <span>•</span>
                    <span>ACL: [{chunk.acl.join(', ')}]</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Security & ACL Decision Evaluation */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. ACL Policy Decision
              </h3>
              {isAccessGranted ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                  <Unlock className="w-3.5 h-3.5 mr-1" />
                  ACCESS GRANTED
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  ACCESS DENIED
                </span>
              )}
            </div>

            {/* Decision Details Card */}
            <div
              className={`p-4 rounded-xl border mb-4 ${
                isAccessGranted
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <div className="text-xs font-semibold mb-2 flex items-center space-x-1.5">
                {isAccessGranted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className={isAccessGranted ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'}>
                  {isAccessGranted
                    ? 'Permitted: User meets ACL and document is unrestricted'
                    : 'Refused: Context restricted or user lacks required ACL'}
                </span>
              </div>

              <div className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
                <div>
                  <strong>User ACLs:</strong> [{currentUser.acls.join(', ')}]
                </div>
                <div>
                  <strong>Document ACLs:</strong> [{selectedChunk.acl.join(', ')}]
                </div>
                <div>
                  <strong>ACL Overlap:</strong>{' '}
                  <span className={hasMatchingAcl ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {hasMatchingAcl ? 'Matched' : 'No overlap (Missing permission)'}
                  </span>
                </div>
                <div>
                  <strong>Context Restricted Flag:</strong>{' '}
                  <span className={selectedChunk.restricted ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {selectedChunk.restricted ? 'TRUE (Restricted document)' : 'FALSE (Unrestricted)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bot Behavior in Teams */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Teams Knowledge Agent Action:
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {isAccessGranted ? (
                  <>
                    The bot will formulate a concise 3-4 sentence response grounded exclusively in{' '}
                    <strong>{selectedChunk.title}</strong>, and cite its source link (
                    {selectedChunk.sourceType === 'confluence' ? 'Confluence URL' : 'Document link'}).
                  </>
                ) : (
                  <>
                    The bot enforces <strong>Refusal Criterion i</strong>:{' '}
                    <em>"If the context is marked as restricted or missing refuse the request."</em>{' '}
                    User will receive a polite security refusal explaining access denial.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Source Link Target: <span className="font-mono text-[10px] break-all">{selectedChunk.sourceType === 'confluence' ? selectedChunk.sourceUrl : selectedChunk.docLink}</span>
          </div>
        </div>
      </div>

      {/* Comprehensive ACL Matrix Across all Documents */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-indigo-500" />
          <span>Full Enterprise Access Control Matrix (All Personas × All Documents)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Document Title</th>
                <th className="py-2.5 px-3 font-semibold">Dept</th>
                <th className="py-2.5 px-3 font-semibold">Source Type</th>
                <th className="py-2.5 px-3 font-semibold">Restricted?</th>
                {ACME_USER_PROFILES.map((u) => (
                  <th key={u.id} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                    {u.name.split(' ')[0]} ({u.department})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ACME_KNOWLEDGE_CHUNKS.map((chunk) => (
                <tr key={chunk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                    {chunk.title}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">
                    {chunk.department}
                  </td>
                  <td className="py-2 px-3 uppercase text-[10px] font-mono text-slate-500">
                    {chunk.sourceType}
                  </td>
                  <td className="py-2 px-3">
                    {chunk.restricted ? (
                      <span className="text-rose-600 font-bold text-[10px] bg-rose-50 dark:bg-rose-950 px-1 py-0.5 rounded">
                        RESTRICTED
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-[10px]">Open</span>
                    )}
                  </td>
                  {ACME_USER_PROFILES.map((u) => {
                    const match = chunk.acl.some((role) => u.acls.includes(role));
                    const canAccess = match && !chunk.restricted;
                    return (
                      <td key={u.id} className="py-2 px-3">
                        {canAccess ? (
                          <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Allow
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-500 text-[11px]">
                            <Lock className="w-3.5 h-3.5 mr-1" />
                            Deny
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
