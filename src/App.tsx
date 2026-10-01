/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TeamsChat } from './components/TeamsChat';
import { KnowledgeBaseExplorer } from './components/KnowledgeBaseExplorer';
import { AclSecuritySimulator } from './components/AclSecuritySimulator';
import { PolicyGuardrailsMatrix } from './components/PolicyGuardrailsMatrix';
import { ACME_USER_PROFILES } from './data/acmeKnowledgeBase';
import { ChatMessage, UserProfile, AgentResponse } from './types';
import { processKnowledgeQuery } from './services/agentEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'acl' | 'guardrails'>('chat');
  const [currentUser, setCurrentUser] = useState<UserProfile>(ACME_USER_PROFILES[3]); // Jordan Lee
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    geminiLive: boolean;
    model: string;
  }>({
    online: true,
    geminiLive: false,
    model: 'gemini-3.8-flash',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hello! I am the ACME Company Knowledge Agent serving three departments: HR, IT, and OPERATIONS.\n\nAsk me any question regarding corporate policies, IT configurations, or warehouse operations. I verify your ACL permissions, keep answers concise (3-4 sentences), and provide direct source citations to Confluence pages or PDF documents.',
      agentResponse: {
        answer: 'Welcome to ACME Teams Knowledge Bot.',
        department: 'GENERAL',
        status: 'SUCCESS',
        citations: [],
        evaluatedChunks: [],
        sentenceCount: 3,
        reasoningTrace: {
          step1_department: {
            identified: 'GENERAL',
            reasoning: 'System initialization greeting.',
          },
          step2_guardrails: {
            sensitiveDetected: false,
          },
          step3_aclCheck: {
            passed: true,
            userAcls: ['ALL_EMPLOYEES'],
            matchingDocsCount: 0,
            accessibleDocsCount: 0,
            restrictedCount: 0,
          },
          step4_responseGeneration: {
            groundedInDocs: true,
            conciseEnforced: true,
            sentenceTarget: '3-4 Sentences',
            actualSentenceCount: 3,
          },
        },
      },
    },
  ]);

  // Check backend server status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          online: true,
          geminiLive: Boolean(data.geminiLive),
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch((_err) => {
        // Fallback to client-side engine if server not available
        setServerStatus((prev) => ({ ...prev, online: false }));
      });
  }, []);

  const handleSendMessage = async (queryText: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: timeStr,
      text: queryText,
      userProfile: currentUser,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let agentResp: AgentResponse;

      // Try server API first
      try {
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            user: currentUser,
          }),
        });

        if (response.ok) {
          agentResp = await response.json();
        } else {
          // Fallback to client-side engine
          agentResp = processKnowledgeQuery(queryText, currentUser);
        }
      } catch (_apiErr) {
        // Fallback to client-side engine
        agentResp = processKnowledgeQuery(queryText, currentUser);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: agentResp.answer,
        agentResponse: agentResp,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'I encountered an unexpected issue evaluating your request. Kindly reach out to support@acme.com',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestQuery = (query: string) => {
    setActiveTab('chat');
    handleSendMessage(query);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Chat reset. Active user: ${currentUser.name} (${currentUser.department}). How can I assist you across HR, IT, or Operations today?`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Enterprise Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        serverStatus={serverStatus}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <TeamsChat
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer currentUser={currentUser} />
        )}

        {activeTab === 'acl' && (
          <AclSecuritySimulator
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}

        {activeTab === 'guardrails' && (
          <PolicyGuardrailsMatrix onTestQuery={handleTestQuery} />
        )}
      </main>
    </div>
  );
}
