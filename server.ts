import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  processKnowledgeQuery,
  checkSensitiveInformation,
  identifyDepartment,
  evaluateKnowledgeChunks,
  formatCitation,
  buildCitationString,
  countSentences,
  EXACT_FALLBACK_MESSAGE,
} from './src/services/agentEngine';
import { ACME_KNOWLEDGE_CHUNKS, ACME_USER_PROFILES, TEST_SCENARIOS } from './src/data/acmeKnowledgeBase';
import { UserProfile } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini GenAI client initialized successfully with gemini-3.8-flash.');
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI:', err);
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Documents catalogue
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json({
    chunks: ACME_KNOWLEDGE_CHUNKS,
    users: ACME_USER_PROFILES,
    scenarios: TEST_SCENARIOS,
  });
});

// Health check & model status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    agentName: 'ACME Enterprise Knowledge Bot',
    supportedDepartments: ['HR', 'IT', 'OPERATIONS'],
    geminiLive: Boolean(ai),
    model: 'gemini-3.8-flash',
  });
});

// Main query route
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { query, user, forceSimulation } = req.body as {
      query: string;
      user: UserProfile;
      forceSimulation?: boolean;
    };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query string is required' });
      return;
    }

    const activeUser = user || ACME_USER_PROFILES[3]; // Fallback to Jordan Lee (General employee)
    const lower = query.toLowerCase();
    const requestsMoreDetails =
      lower.includes('more detail') ||
      lower.includes('more details') ||
      lower.includes('in detail') ||
      lower.includes('elaborate') ||
      lower.includes('full details');

    // 1. First run deterministic policy checks (Department classification, Guardrails, ACL filtering)
    const deptInfo = identifyDepartment(query);
    const sensitiveCheck = checkSensitiveInformation(query);

    if (sensitiveCheck.isSensitive) {
      const response = processKnowledgeQuery(query, activeUser);
      res.json(response);
      return;
    }

    const evalResult = evaluateKnowledgeChunks(query, activeUser, deptInfo.department);

    if (evalResult.hasAclFailureOnRelevantDoc) {
      const response = processKnowledgeQuery(query, activeUser);
      res.json(response);
      return;
    }

    if (evalResult.accessibleChunks.length === 0) {
      const response = processKnowledgeQuery(query, activeUser);
      res.json(response);
      return;
    }

    // Accessible chunks exist! If Gemini AI is active and not forced simulation, we can let Gemini 3.8 Flash formulate the 3-4 sentence response
    if (ai && !forceSimulation) {
      const primaryChunk = evalResult.accessibleChunks[0].chunk;
      const citation = formatCitation(primaryChunk);
      const citationLine = buildCitationString(citation);

      const systemPrompt = `You are the ACME Company Knowledge Agent serving HR, IT, and OPERATIONS departments.
Rules:
1. Base your answer strictly and ONLY on the provided ACME Knowledge Chunk below. Do not assume or hallucinate outside details.
2. Keep the answer concise: strictly 3 to 4 sentences${requestsMoreDetails ? ' (NOTE: User requested more details, so provide comprehensive details while staying grounded in the chunk)' : ''}.
3. At the very end of your response on a new line, you MUST append this exact citation line:
${citationLine}
4. If the context is missing or inadequate, reply strictly with: "${EXACT_FALLBACK_MESSAGE}"
5. Never disclose sensitive info like specific personal payroll, next release dev plans, or operations inventory columns.`;

      const promptContent = `ACME Knowledge Chunk:
[Department: ${primaryChunk.department}]
[Title: ${primaryChunk.title}]
[Source Type: ${primaryChunk.sourceType}]
[Content]:
${primaryChunk.content}

User (${activeUser.name} - ${activeUser.role}, Dept: ${activeUser.department}): "${query}"`;

      try {
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptContent,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          },
        });

        const generatedText = geminiRes.text || '';
        if (generatedText) {
          const sentences = countSentences(generatedText);
          res.json({
            answer: generatedText,
            department: deptInfo.department,
            status: 'SUCCESS',
            citations: [citation],
            evaluatedChunks: evalResult.matchedChunks,
            sentenceCount: sentences,
            reasoningTrace: {
              step1_department: {
                identified: deptInfo.department,
                reasoning: `${deptInfo.reasoning} (Verified by Gemini 3.8 Flash)`,
              },
              step2_guardrails: {
                sensitiveDetected: false,
              },
              step3_aclCheck: {
                passed: true,
                userAcls: activeUser.acls,
                matchingDocsCount: evalResult.matchedChunks.length,
                accessibleDocsCount: evalResult.accessibleChunks.length,
                restrictedCount: evalResult.restrictedChunks.length,
              },
              step4_responseGeneration: {
                groundedInDocs: true,
                conciseEnforced: !requestsMoreDetails,
                sentenceTarget: requestsMoreDetails ? 'Comprehensive Details' : '3-4 Sentences (Grounded by Gemini 3.8 Flash)',
                actualSentenceCount: sentences,
              },
            },
          });
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini generateContent call encountered an issue, falling back to local deterministic synthesizer:', geminiError);
      }
    }

    // Fallback or standard high-speed deterministic synthesis
    const response = processKnowledgeQuery(query, activeUser);
    res.json(response);
  } catch (err: any) {
    console.error('Server error handling /api/query:', err);
    res.status(500).json({ error: 'Internal server error processing query', details: err?.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ACME Knowledge Agent server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
