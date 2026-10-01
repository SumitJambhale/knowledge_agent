import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  Building2,
  Server,
  HardHat,
  ShieldAlert,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  Lock,
  Compass,
} from 'lucide-react';
import { ChatMessage, Department, UserProfile } from '../types';
import { TEST_SCENARIOS } from '../data/acmeKnowledgeBase';

interface TeamsChatProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
}

export const TeamsChat: React.FC<TeamsChatProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  currentUser,
  setCurrentUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const query = inputText;
    setInputText('');
    onSendMessage(query);
  };

  const handleScenarioClick = (scenarioQuery: string, suggestedUserIndex?: number) => {
    if (suggestedUserIndex !== undefined) {
      // Allow switching user if suggested for the scenario
      // (Parent component or context can handle or user can see it)
    }
    setInputText(scenarioQuery);
  };

  const getDepartmentBadge = (dept: Department) => {
    switch (dept) {
      case 'HR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Building2 className="w-3 h-3 mr-1 text-emerald-600" />
            HR Department
          </span>
        );
      case 'IT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Server className="w-3 h-3 mr-1 text-sky-600" />
            IT Department
          </span>
        );
      case 'OPERATIONS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <HardHat className="w-3 h-3 mr-1 text-amber-600" />
            OPERATIONS Department
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <Compass className="w-3 h-3 mr-1 text-slate-600" />
            General Inquiry
          </span>
        );
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Verified & Grounded
          </span>
        );
      case 'REFUSED_SENSITIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" />
            Refused: Sensitive Topic (Criterion ii)
          </span>
        );
      case 'REFUSED_RESTRICTED_ACL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Lock className="w-3 h-3 mr-1 text-purple-600" />
            Refused: Restricted / ACL Missing (Criterion i)
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            Document Missing / Support Fallback
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      {/* Quick Scenario Pills (Test Suite) */}
      <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mb-3 shadow-xs">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Test Scenarios (All Prompt Requirements)</span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            Click any scenario to populate query:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {TEST_SCENARIOS.map((sc) => {
            let color = 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400';
            if (sc.category === 'HR') color = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
            if (sc.category === 'IT') color = 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100';
            if (sc.category === 'OPERATIONS') color = 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
            if (sc.category === 'SENSITIVE_REFUSAL') color = 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';
            if (sc.category === 'ACL_RESTRICTED') color = 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100';
            if (sc.category === 'NOT_FOUND') color = 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
            if (sc.category === 'MORE_DETAILS') color = 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100';

            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioClick(sc.query, sc.suggestedUserIndex)}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all shadow-2xs ${color}`}
                title={sc.description}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Teams Chat Message Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Teams Conversation Header Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ACME Knowledge Agent Bot
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-500 font-medium">Available</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct Teams Chat with Active User: <strong className="text-slate-700 dark:text-slate-300">{currentUser.name}</strong> ({currentUser.department}, ACLs: {currentUser.acls.join(', ')})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClearChat}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Clear chat history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const isTraceExpanded = expandedTraceId === msg.id;

            if (!isBot) {
              // User message bubble (Teams right-aligned style)
              return (
                <div key={msg.id} className="flex justify-end items-start space-x-2 pl-12">
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-xs max-w-2xl">
                    <div className="text-[11px] text-indigo-200 font-medium mb-0.5 flex items-center justify-between">
                      <span>{msg.userProfile?.name || currentUser.name}</span>
                      <span className="ml-3 text-[10px] text-indigo-200/80">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <img
                    src={msg.userProfile?.avatar || currentUser.avatar}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-indigo-300 shrink-0"
                  />
                </div>
              );
            }

            // Bot message card (Teams Adaptive Card style)
            const resp = msg.agentResponse;
            return (
              <div key={msg.id} className="flex items-start space-x-3 pr-12">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/90 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
                  {/* Card Header with Department, Status, and Sentence Count */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        ACME Knowledge Agent
                      </span>
                      {resp && getDepartmentBadge(resp.department)}
                      {resp && getStatusBadge(resp.status)}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      {resp && resp.sentenceCount > 0 && (
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-medium" title="Sentence count enforcement">
                          {resp.sentenceCount} {resp.sentenceCount === 1 ? 'sentence' : 'sentences'}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Main Answer Text */}
                  <div className="py-3 text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Source Citations Section */}
                  {resp && resp.citations && resp.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Source Citations (Document References):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resp.citations.map((citation, idx) => {
                          const isConfluence = citation.type === 'confluence';
                          return (
                            <a
                              key={idx}
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors shadow-2xs ${
                                isConfluence
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <span className="font-semibold">
                                {isConfluence ? 'Confluence Link:' : 'Document Link:'}
                              </span>
                              <span className="underline decoration-slate-400">{citation.title}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Collapsible Inspector / Reasoning Trace */}
                  {resp && resp.reasoningTrace && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() =>
                          setExpandedTraceId(isTraceExpanded ? null : msg.id)
                        }
                        className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition-colors"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Agent Reasoning & ACL Metadata Inspector</span>
                        </span>
                        {isTraceExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {isTraceExpanded && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 font-sans">
                          {/* Step 1 */}
                          <div className="flex items-start space-x-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                              Step 1 [Department ID]:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              Identified <strong className="text-slate-900 dark:text-white">{resp.reasoningTrace.step1_department.identified}</strong>. {resp.reasoningTrace.step1_department.reasoning}
                            </span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex items-start space-x-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                              Step 2 [Guardrails]:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {resp.reasoningTrace.step2_guardrails.sensitiveDetected ? (
                                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                  Sensitive request detected: {resp.reasoningTrace.step2_guardrails.category}. {resp.reasoningTrace.step2_guardrails.reasoning}
                                </span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400">
                                  Passed sensitive policy checks (No restricted payroll of specific person, dev release plans, or ops inventory columns requested).
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex items-start space-x-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                              Step 3 [ACL Check]:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              User ACLs: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">{resp.reasoningTrace.step3_aclCheck.userAcls.join(', ')}</code>. Found {resp.reasoningTrace.step3_aclCheck.matchingDocsCount} candidate chunks ({resp.reasoningTrace.step3_aclCheck.accessibleDocsCount} accessible, {resp.reasoningTrace.step3_aclCheck.restrictedCount} restricted). Status: {resp.reasoningTrace.step3_aclCheck.passed ? 'PERMITTED' : 'ACCESS DENIED'}.
                            </span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex items-start space-x-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                              Step 4 [Synthesis & Citations]:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                              Grounded in chunks: {resp.reasoningTrace.step4_responseGeneration.groundedInDocs ? 'Yes' : 'No'}. Target format: {resp.reasoningTrace.step4_responseGeneration.sentenceTarget}. Actual sentences: {resp.reasoningTrace.step4_responseGeneration.actualSentenceCount}.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    Evaluating department intent, checking ACL metadata & generating concise response...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about HR policies, IT assistance, or Operations SOPs (e.g. parental leave, VPN setup, forklift inspection)..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send Query</span>
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
            <span>
              Tip: Answers are strictly 3-4 sentences and ground-cited. Add <em>"Please provide more details"</em> to expand.
            </span>
            <span className="font-mono text-[10px]">ACME Teams Agent v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
