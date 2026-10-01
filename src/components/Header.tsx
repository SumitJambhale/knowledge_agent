import React from 'react';
import {
  Bot,
  Building2,
  HardHat,
  Server,
  ShieldCheck,
  User,
  Sliders,
  Database,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ACME_USER_PROFILES } from '../data/acmeKnowledgeBase';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'knowledge' | 'acl' | 'guardrails';
  setActiveTab: (tab: 'chat' | 'knowledge' | 'acl' | 'guardrails') => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  serverStatus: { online: boolean; geminiLive: boolean; model: string };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  serverStatus,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      {/* Top Banner / Corporate Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agent Title */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  ACME Knowledge Agent
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Teams Bot
                </span>
                {serverStatus.geminiLive && (
                  <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini 3.8 Flash</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Unified AI Assistant for Human Resources • Information Technology • Operations
              </p>
            </div>
          </div>

          {/* Department Badges & Active Persona Switcher */}
          <div className="flex items-center space-x-4">
            {/* Departments Supported */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <span className="text-slate-500 font-medium">Serving:</span>
              <span className="inline-flex items-center text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 font-semibold">
                <Building2 className="w-3 h-3 mr-1" /> HR
              </span>
              <span className="inline-flex items-center text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/60 font-semibold">
                <Server className="w-3 h-3 mr-1" /> IT
              </span>
              <span className="inline-flex items-center text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/60 font-semibold">
                <HardHat className="w-3 h-3 mr-1" /> OPERATIONS
              </span>
            </div>

            {/* Active User Switcher (For testing ACL metadata) */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
              <div className="flex items-center space-x-2 pl-2 pr-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
                <div className="text-left hidden sm:block pr-1">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <span>{currentUser.role}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-indigo-400 font-medium">ACL: {currentUser.acls.length}</span>
                  </div>
                </div>
              </div>

              <select
                aria-label="Switch User Persona for ACL testing"
                value={currentUser.id}
                onChange={(e) => {
                  const selected = ACME_USER_PROFILES.find((u) => u.id === e.target.value);
                  if (selected) setCurrentUser(selected);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-1 px-2 rounded-lg border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
              >
                {ACME_USER_PROFILES.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department} - {user.securityClearance})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-t border-slate-800 pt-1 pb-2 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Teams Bot Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Knowledge Base & Chunks (15)</span>
          </button>

          <button
            onClick={() => setActiveTab('acl')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'acl'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ACL & Security Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('guardrails')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'guardrails'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Policy & Guardrails Matrix</span>
          </button>
        </div>
      </div>
    </header>
  );
};
