export type Department = 'HR' | 'IT' | 'OPERATIONS' | 'GENERAL';

export type SourceType = 'confluence' | 'pdf' | 'text';

export interface KnowledgeChunk {
  id: string;
  title: string;
  department: Department;
  sourceType: SourceType;
  sourceUrl?: string; // For confluence
  docLink?: string;   // For PDF or text
  acl: string[];      // Roles or access groups allowed
  restricted: boolean;
  classification: 'Public' | 'Internal' | 'Confidential' | 'Strictly Confidential';
  content: string;
  tags: string[];
  lastUpdated: string;
  isSensitiveTarget?: 'payroll_individual' | 'next_release_development_plans' | 'operations_inventory_column';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: Department;
  acls: string[];
  avatar: string;
  securityClearance: 'Standard' | 'Elevated' | 'Admin' | 'Executive';
}

export interface Citation {
  title: string;
  type: SourceType;
  url: string;
  department: Department;
  chunkId: string;
}

export interface EvaluatedChunk {
  chunk: KnowledgeChunk;
  aclMatch: boolean;
  userMissingAcl: string[];
  isRestricted: boolean;
  relevanceScore: number;
  snippet: string;
}

export interface QueryAnalysis {
  department: Department;
  departmentConfidence: number;
  isSensitive: boolean;
  sensitiveCategory?: 'payroll_individual' | 'next_release_development_plans' | 'operations_inventory_column';
  sensitiveExplanation?: string;
  requestsMoreDetails: boolean;
}

export interface AgentResponse {
  answer: string;
  department: Department;
  status: 'SUCCESS' | 'REFUSED_SENSITIVE' | 'REFUSED_RESTRICTED_ACL' | 'NOT_FOUND';
  refusalReason?: string;
  citations: Citation[];
  evaluatedChunks: EvaluatedChunk[];
  sentenceCount: number;
  reasoningTrace: {
    step1_department: {
      identified: Department;
      reasoning: string;
    };
    step2_guardrails: {
      sensitiveDetected: boolean;
      category?: string;
      reasoning?: string;
    };
    step3_aclCheck: {
      passed: boolean;
      userAcls: string[];
      matchingDocsCount: number;
      accessibleDocsCount: number;
      restrictedCount: number;
    };
    step4_responseGeneration: {
      groundedInDocs: boolean;
      conciseEnforced: boolean;
      sentenceTarget: string;
      actualSentenceCount: number;
    };
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text: string;
  userProfile?: UserProfile;
  agentResponse?: AgentResponse;
}
