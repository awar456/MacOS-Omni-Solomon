import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // WebSocket Server for Gemini Live API
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      clientWs.send(JSON.stringify({ error: 'No server API key found for Live API.' }));
      clientWs.close();
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are OmniOS, an elite voice-driven macOS systems controller. Answer user queries concisely, stating exact terminal commands when requested.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (err) {
          console.error('Error handling WS audio message:', err);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {
          // ignore session close errors
        }
      });
    } catch (err) {
      console.error('Error establishing Gemini Live session:', err);
      clientWs.send(JSON.stringify({ error: 'Live API connection failed.' }));
      clientWs.close();
    }
  });

  // API Status endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'online',
      hasServerApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      recommendedModel: 'gemini-3.8-flash',
      availableModels: ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon', 'gemini-3.8-live']
    });
  });

  // Multi-Turn Chatbot Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const clientKey = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
      const apiKey = clientKey || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(401).json({
          error: 'No valid Google Gemini API key detected. Please configure your API key in the top bar.'
        });
      }

      const { messages, model = 'gemini-3.8-flash', role = 'architect' } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const roleInstructions: Record<string, string> = {
        architect: "You are the OmniOS Principal macOS Systems Architect. You provide deep Unix/Darwin systems advice, zsh scripts, launchd agents, and plist modifications.",
        security: "You are the OmniOS Senior macOS Offensive Security Auditor. You audit ports, Gatekeeper, SIP, FileVault, firewall rules, and guide users through hardening their system against local threats.",
        performance: "You are the OmniOS Apple Silicon & Performance Tuner. You focus on Mach kernel memory, unified memory bandwidth, SSD TRIM, fan management, thermal throttling, and battery preservation."
      };

      const systemInstruction = `${roleInstructions[role] || roleInstructions.architect}
Always respond clearly and authoritatively. When suggesting terminal commands or scripts, output clean copy-pasteable bash/zsh in markdown code blocks (\`\`\`zsh ... \`\`\`) with brief explanations of what each flag accomplishes.`;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Try requested model, with deduplicated fallback list and 6s timeout per model
      const fallbackList = Array.from(new Set([model, 'gemini-3.8-flash', 'gemini-3.1-flash-lite']));
      let lastError: unknown = null;
      let replyText: string | null = null;
      let finalModel = model;

      for (const m of fallbackList) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout connecting to ${m}`)), 6000)
          );
          const response = await Promise.race([
            ai.models.generateContent({
              model: m,
              contents,
              config: { systemInstruction }
            }),
            timeoutPromise
          ]);
          if (response && response.text) {
            replyText = response.text;
            finalModel = m;
            break;
          }
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (replyText) {
        return res.json({
          text: replyText,
          modelUsed: finalModel
        });
      }

      const errMsg = lastError instanceof Error ? lastError.message : 'Chat generation temporarily unavailable';
      return res.status(503).json({ error: errMsg });
    } catch (err: unknown) {
      console.error('Chat API Error:', err);
      const errMsg = err instanceof Error ? err.message : 'Chat generation failed';
      return res.status(500).json({ error: errMsg });
    }
  });

  // Single-Prompt Asynchronous Intelligent Compiler Endpoint
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const clientKey = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
      const apiKey = clientKey || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(401).json({
          error: 'No valid Google Gemini API key detected. Please configure your API key in the top bar Access Key panel.'
        });
      }

      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let lastError: unknown = null;
      let generatedText: string | null = null;

      const instruction = systemInstruction || 
        `You are OmniOS, an elite macOS principal systems architect, automation engineer, and security auditor.
Analyze user automation/optimization requests and generate production-grade, safe, non-destructive zsh shell scripts or configurations for macOS (Apple Silicon / Intel).
Structure output clearly:
1. Markdown code block containing the exact copy-pasteable #!/bin/zsh script with comments.
2. Safety Assessment (Safe, Sudo Required, or Advanced).
3. Summary of what each command does.
4. Audio completion hook (say "..." or afplay Glass.aiff).`;

      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout connecting to ${model}`)), 6000)
          );
          const response = await Promise.race([
            ai.models.generateContent({
              model,
              contents: prompt,
              config: { systemInstruction: instruction }
            }),
            timeoutPromise
          ]);
          if (response && response.text) {
            generatedText = response.text;
            break;
          }
        } catch (e) {
          lastError = e;
          continue;
        }
      }

      if (generatedText) {
        return res.json({ text: generatedText });
      }

      const errMsg = lastError instanceof Error ? lastError.message : 'Model temporarily busy';
      return res.status(503).json({ error: errMsg });
    } catch (err: unknown) {
      console.error('Gemini API Error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown generation error';
      return res.status(500).json({ error: errMsg });
    }
  });

  // Mount Vite or serve static files
  if (process.env.NODE_ENV !== 'production') {
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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniOS] Full-Stack controller server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[OmniOS] Failed to start server:', err);
});
