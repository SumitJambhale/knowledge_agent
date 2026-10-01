import { ACME_KNOWLEDGE_CHUNKS } from '../data/acmeKnowledgeBase';
import {
  AgentResponse,
  Citation,
  Department,
  EvaluatedChunk,
  KnowledgeChunk,
  QueryAnalysis,
  UserProfile,
} from '../types';

export const EXACT_FALLBACK_MESSAGE =
  'I don’t have the information you are looking for kindly reach out to support@acme.com';

/**
 * Step 1: Identify Query Department (HR / IT / OPERATIONS)
 */
export function identifyDepartment(query: string): { department: Department; confidence: number; reasoning: string } {
  const lower = query.toLowerCase();

  const hrKeywords = [
    'leave', 'parental', 'maternity', 'paternity', 'vacation', 'pto', 'holiday',
    'benefits', 'health', 'medical', 'dental', 'vision', 'wellness', 'stipend',
    'remote work', 'wfh', 'home office', 'hr', 'human resources', 'payroll',
    'salary', 'compensation', 'bonus', 'cultureamp', 'workday', 'performance review',
    'promotion', 'merit', 'people partner', '401k', 'expensify', 'onboarding'
  ];

  const itKeywords = [
    'vpn', 'mfa', '2fa', 'token', 'okta', 'globalprotect', 'wifi', 'wi-fi',
    'password', 'laptop', 'macbook', 'thinkpad', 'hardware', 'servicenow',
    'jamf', 'intune', 'cloud', 'aws', 'gcp', 'iam', 'teleport', 'ssh', 'it helpdesk',
    'it-help', 'crowdstrike', 'software provisioning', 'development plans', 'git',
    'next release', 'jira', 'slack access', 'active directory', 'network'
  ];

  const opsKeywords = [
    'forklift', 'warehouse', 'pallet', 'safety inspection', 'ppe', 'boots',
    'hard hat', 'loading dock', 'facility', 'visitor badge', 'dockmaster',
    'evacuation', 'fire warden', 'bcp', 'business continuity', 'disaster recovery',
    'vendor audit', 'iso 9001', 'operations inventory', 'supply chain', 'freight',
    'logistics', 'campus security', 'facilities', 'maintenance central', 'muster station'
  ];

  let hrScore = 0;
  let itScore = 0;
  let opsScore = 0;

  for (const kw of hrKeywords) {
    if (lower.includes(kw)) hrScore += 1;
  }
  for (const kw of itKeywords) {
    if (lower.includes(kw)) itScore += 1;
  }
  for (const kw of opsKeywords) {
    if (lower.includes(kw)) opsScore += 1;
  }

  if (hrScore === 0 && itScore === 0 && opsScore === 0) {
    return {
      department: 'GENERAL',
      confidence: 0.2,
      reasoning: 'No specific domain keywords detected; classified as general company inquiry.',
    };
  }

  if (hrScore >= itScore && hrScore >= opsScore) {
    return {
      department: 'HR',
      confidence: Math.min(1.0, 0.4 + hrScore * 0.2),
      reasoning: `Identified Human Resources intent based on matched keywords (${hrScore} terms: parental, benefits, stipend, policy, etc.).`,
    };
  }

  if (itScore >= hrScore && itScore >= opsScore) {
    return {
      department: 'IT',
      confidence: Math.min(1.0, 0.4 + itScore * 0.2),
      reasoning: `Identified Information Technology intent based on matched keywords (${itScore} terms: vpn, mfa, hardware, network, etc.).`,
    };
  }

  return {
    department: 'OPERATIONS',
    confidence: Math.min(1.0, 0.4 + opsScore * 0.2),
    reasoning: `Identified Operations intent based on matched keywords (${opsScore} terms: warehouse, facility, safety, logistics, etc.).`,
  };
}

/**
 * Step 2: Sensitive Information Detection (Criteria ii)
 * Refuse:
 * - Payroll of specific person
 * - Development plans for next release
 * - Operations inventory column
 */
export function checkSensitiveInformation(query: string): {
  isSensitive: boolean;
  category?: 'payroll_individual' | 'next_release_development_plans' | 'operations_inventory_column';
  refusalMessage?: string;
  reasoning?: string;
} {
  const lower = query.toLowerCase();

  // 1. Payroll of specific person
  // Patterns like "payroll of John", "salary of Jane Doe", "how much does Alice earn", "bonus of Bob", "individual payroll"
  const payrollKeywords = ['payroll', 'salary', 'compensation', 'bonus', 'paycheck', 'earnings', 'hourly rate', 'how much does'];
  const personIndicators = [
    'john', 'jane', 'doe', 'smith', 'specific person', 'specific employee', 'individual', 'someone', 'sarah', 'alex', 'marcus', 'person', 'executive pay', 'ceo'
  ];

  const hasPayrollWord = payrollKeywords.some((w) => lower.includes(w));
  const hasPersonWord = personIndicators.some((p) => lower.includes(p));

  if (hasPayrollWord && (hasPersonWord || lower.includes('payroll of') || lower.includes('salary of') || lower.includes('compensation of'))) {
    return {
      isSensitive: true,
      category: 'payroll_individual',
      refusalMessage:
        'Refusal: ACME Information Security and HR Privacy Policy strictly prohibits disclosing the payroll, salary, or compensation details of specific individuals. For authorized compensation inquiries, please contact your HR Business Partner directly.',
      reasoning: 'Detected request asking for personal salary/payroll information of an individual employee.',
    };
  }

  // 2. Development plans for next release
  const devPlansPatterns = [
    'development plan',
    'development plans',
    'plans for next release',
    'next release',
    'future release',
    'unreleased feature',
    'project falcon',
    'architecture roadmap',
    'engineering roadmap',
    'dev plans',
  ];

  const isDevPlans = devPlansPatterns.some((pattern) => lower.includes(pattern));
  if (isDevPlans) {
    return {
      isSensitive: true,
      category: 'next_release_development_plans',
      refusalMessage:
        'Refusal: ACME Engineering Policy strictly restricts the disclosure of unannounced development plans, upcoming sprint architectures, and confidential next release milestones. Please consult your engineering lead through authorized quarterly review sessions.',
      reasoning: 'Detected request probing unannounced internal development plans and next product release milestones.',
    };
  }

  // 3. Operations inventory column
  const opsInventoryPatterns = [
    'operations inventory column',
    'inventory column',
    'inventory columns',
    'valuation column',
    'sku cost column',
    'stock valuation metrics',
    'raw inventory column',
    'operations inventory master',
  ];

  const isOpsInventory = opsInventoryPatterns.some((pattern) => lower.includes(pattern));
  if (isOpsInventory) {
    return {
      isSensitive: true,
      category: 'operations_inventory_column',
      refusalMessage:
        'Refusal: ACME Operations Governance forbids querying or exporting raw operations inventory columns, supplier cost bases, and internal warehouse valuation ledgers. Authorized requests must be processed through the Operations Data Governance Portal.',
      reasoning: 'Detected request targeting confidential operations inventory schema columns and internal valuation data.',
    };
  }

  return { isSensitive: false };
}

/**
 * Step 3: Retrieval & ACL Evaluation
 * Matches chunks, checks ACL metadata, evaluates restricted flags
 */
export function evaluateKnowledgeChunks(
  query: string,
  user: UserProfile,
  department: Department
): {
  matchedChunks: EvaluatedChunk[];
  accessibleChunks: EvaluatedChunk[];
  restrictedChunks: EvaluatedChunk[];
  hasAclFailureOnRelevantDoc: boolean;
} {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const evaluated: EvaluatedChunk[] = [];

  for (const chunk of ACME_KNOWLEDGE_CHUNKS) {
    // Score relevance
    let score = 0;
    const chunkText = (chunk.title + ' ' + chunk.content + ' ' + chunk.tags.join(' ')).toLowerCase();

    for (const term of queryTerms) {
      if (chunk.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
      if (chunk.title.toLowerCase().includes(term)) score += 4;
      if (chunkText.includes(term)) score += 1;
    }

    if (chunk.department === department) {
      score += 3;
    }

    if (score > 4) {
      // Check user ACLs against chunk ACL
      const aclMatch = chunk.acl.some((requiredAcl) => user.acls.includes(requiredAcl));
      const missingAcl = chunk.acl.filter((requiredAcl) => !user.acls.includes(requiredAcl));

      // Also check restricted flag
      const isRestricted = chunk.restricted || !aclMatch;

      evaluated.push({
        chunk,
        aclMatch,
        userMissingAcl: missingAcl,
        isRestricted,
        relevanceScore: score,
        snippet: chunk.content.substring(0, 160) + '...',
      });
    }
  }

  // Sort by score descending
  evaluated.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const accessibleChunks = evaluated.filter((e) => !e.isRestricted && e.aclMatch);
  const restrictedChunks = evaluated.filter((e) => e.isRestricted || !e.aclMatch);
  const hasAclFailureOnRelevantDoc = restrictedChunks.length > 0 && accessibleChunks.length === 0;

  return {
    matchedChunks: evaluated,
    accessibleChunks,
    restrictedChunks,
    hasAclFailureOnRelevantDoc,
  };
}

/**
 * Format Citation according to requirement:
 * i. for confluence link use the document url
 * ii. for the pdf, text document attach the document link as the source
 */
export function formatCitation(chunk: KnowledgeChunk): Citation {
  let url = '';
  if (chunk.sourceType === 'confluence') {
    url = chunk.sourceUrl || 'https://acme.atlassian.net/wiki';
  } else {
    url = chunk.docLink || 'https://docs.acme.corp';
  }

  return {
    title: chunk.title,
    type: chunk.sourceType,
    url,
    department: chunk.department,
    chunkId: chunk.id,
  };
}

export function buildCitationString(citation: Citation): string {
  if (citation.type === 'confluence') {
    return `Source: Confluence Page [${citation.title}](${citation.url})`;
  } else if (citation.type === 'pdf') {
    return `Source: Document File (PDF) [${citation.title}](${citation.url})`;
  } else {
    return `Source: Document File (Text) [${citation.title}](${citation.url})`;
  }
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const cleaned = text.replace(/Source:.*$/i, '').trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+(\s|$)/g);
  return sentences ? sentences.length : 1;
}

/**
 * Enforce concise 3-4 sentences response
 */
export function enforceConciseLength(text: string, maxSentences: number = 4): string {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts || parts.length <= maxSentences) {
    return text.trim();
  }
  return parts.slice(0, maxSentences).join(' ').trim();
}

/**
 * Synthesize grounded response using accessible document chunks
 */
export function synthesizeGroundedResponse(
  query: string,
  chunks: KnowledgeChunk[],
  requestsMoreDetails: boolean
): string {
  if (chunks.length === 0) {
    return EXACT_FALLBACK_MESSAGE;
  }

  const primaryChunk = chunks[0];
  const content = primaryChunk.content;

  if (requestsMoreDetails) {
    // Provide comprehensive details
    return `Here are the detailed guidelines from the official ACME ${primaryChunk.department} knowledge documentation on "${primaryChunk.title}":\n\n${content}\n\nEmployees are advised to follow standard company procedures and review related intranet references for complete specifications.`;
  }

  // Generate concise 3-4 sentence response strictly based on the chunk
  // Split chunk content into sentences
  const sentences = content.match(/[^.!?]+[.!?]+(\s|$)/g) || [content];

  if (sentences.length >= 3) {
    // Pick first 3 or 4 sentences
    const count = Math.min(4, Math.max(3, sentences.length));
    return sentences.slice(0, count).join('').trim();
  } else {
    // Combine primary chunk sentences and secondary if available
    let combined = sentences.join('').trim();
    if (chunks.length > 1) {
      const extraSentences = chunks[1].content.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
      for (const extra of extraSentences) {
        combined += ' ' + extra.trim();
        const currentCount = (combined.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length;
        if (currentCount >= 3) break;
      }
    }
    return combined;
  }
}

/**
 * Main Knowledge Agent Pipeline
 */
export function processKnowledgeQuery(query: string, user: UserProfile): AgentResponse {
  const queryTrimmed = query.trim();
  const lower = queryTrimmed.toLowerCase();
  const requestsMoreDetails =
    lower.includes('more detail') ||
    lower.includes('more details') ||
    lower.includes('in detail') ||
    lower.includes('elaborate') ||
    lower.includes('step by step detailed') ||
    lower.includes('full details');

  // Step 1: Identify Department
  const deptResult = identifyDepartment(queryTrimmed);
  const department = deptResult.department;

  // Step 2: Check Sensitive Information Guardrails (Refusal Criteria ii)
  const sensitiveCheck = checkSensitiveInformation(queryTrimmed);
  if (sensitiveCheck.isSensitive) {
    return {
      answer: sensitiveCheck.refusalMessage!,
      department,
      status: 'REFUSED_SENSITIVE',
      refusalReason: sensitiveCheck.reasoning,
      citations: [],
      evaluatedChunks: [],
      sentenceCount: countSentences(sensitiveCheck.refusalMessage!),
      reasoningTrace: {
        step1_department: {
          identified: department,
          reasoning: deptResult.reasoning,
        },
        step2_guardrails: {
          sensitiveDetected: true,
          category: sensitiveCheck.category,
          reasoning: sensitiveCheck.reasoning,
        },
        step3_aclCheck: {
          passed: false,
          userAcls: user.acls,
          matchingDocsCount: 0,
          accessibleDocsCount: 0,
          restrictedCount: 0,
        },
        step4_responseGeneration: {
          groundedInDocs: false,
          conciseEnforced: true,
          sentenceTarget: 'Refusal triggered',
          actualSentenceCount: countSentences(sensitiveCheck.refusalMessage!),
        },
      },
    };
  }

  // Step 3: Retrieval & ACL Evaluation
  const evalResult = evaluateKnowledgeChunks(queryTrimmed, user, department);

  // Check Criteria i: If context is marked as restricted or missing user ACL, refuse request!
  if (evalResult.hasAclFailureOnRelevantDoc) {
    const refusalText =
      'Refusal: The requested document context is marked as restricted or requires elevated Access Control List (ACL) permissions not associated with your account. Under ACME information security policy, access to this material is denied.';

    return {
      answer: refusalText,
      department,
      status: 'REFUSED_RESTRICTED_ACL',
      refusalReason: `User lacks required ACL tags for matching documents: ${evalResult.restrictedChunks
        .map((r) => r.userMissingAcl.join(', '))
        .join('; ')} or document is marked restricted.`,
      citations: [],
      evaluatedChunks: evalResult.matchedChunks,
      sentenceCount: countSentences(refusalText),
      reasoningTrace: {
        step1_department: {
          identified: department,
          reasoning: deptResult.reasoning,
        },
        step2_guardrails: {
          sensitiveDetected: false,
        },
        step3_aclCheck: {
          passed: false,
          userAcls: user.acls,
          matchingDocsCount: evalResult.matchedChunks.length,
          accessibleDocsCount: 0,
          restrictedCount: evalResult.restrictedChunks.length,
        },
        step4_responseGeneration: {
          groundedInDocs: false,
          conciseEnforced: true,
          sentenceTarget: 'Refusal triggered',
          actualSentenceCount: countSentences(refusalText),
        },
      },
    };
  }

  // Check Criteria 3: If no valid document found for the response
  if (evalResult.accessibleChunks.length === 0) {
    return {
      answer: EXACT_FALLBACK_MESSAGE,
      department,
      status: 'NOT_FOUND',
      refusalReason: 'No relevant document chunk found in ACME knowledge base matching query terms.',
      citations: [],
      evaluatedChunks: [],
      sentenceCount: countSentences(EXACT_FALLBACK_MESSAGE),
      reasoningTrace: {
        step1_department: {
          identified: department,
          reasoning: deptResult.reasoning,
        },
        step2_guardrails: {
          sensitiveDetected: false,
        },
        step3_aclCheck: {
          passed: true,
          userAcls: user.acls,
          matchingDocsCount: 0,
          accessibleDocsCount: 0,
          restrictedCount: 0,
        },
        step4_responseGeneration: {
          groundedInDocs: false,
          conciseEnforced: true,
          sentenceTarget: 'Standard Fallback',
          actualSentenceCount: countSentences(EXACT_FALLBACK_MESSAGE),
        },
      },
    };
  }

  // Step 4: Create Grounded Response & Citations
  const accessibleRawChunks = evalResult.accessibleChunks.map((e) => e.chunk);
  const primaryCitation = formatCitation(accessibleRawChunks[0]);
  const citations = [primaryCitation];

  // Optional second citation if multi-source
  if (accessibleRawChunks.length > 1 && evalResult.accessibleChunks[1].relevanceScore > 8) {
    citations.push(formatCitation(accessibleRawChunks[1]));
  }

  let baseAnswer = synthesizeGroundedResponse(queryTrimmed, accessibleRawChunks, requestsMoreDetails);

  // Append citation in answer text as well
  const citationLinks = citations.map(buildCitationString).join('\n');
  const fullAnswer = `${baseAnswer}\n\n${citationLinks}`;

  const sentences = countSentences(baseAnswer);

  return {
    answer: fullAnswer,
    department,
    status: 'SUCCESS',
    citations,
    evaluatedChunks: evalResult.matchedChunks,
    sentenceCount: sentences,
    reasoningTrace: {
      step1_department: {
        identified: department,
        reasoning: deptResult.reasoning,
      },
      step2_guardrails: {
        sensitiveDetected: false,
      },
      step3_aclCheck: {
        passed: true,
        userAcls: user.acls,
        matchingDocsCount: evalResult.matchedChunks.length,
        accessibleDocsCount: evalResult.accessibleChunks.length,
        restrictedCount: evalResult.restrictedChunks.length,
      },
      step4_responseGeneration: {
        groundedInDocs: true,
        conciseEnforced: !requestsMoreDetails,
        sentenceTarget: requestsMoreDetails ? 'Comprehensive (User Requested)' : '3-4 Sentences strictly',
        actualSentenceCount: sentences,
      },
    },
  };
}
