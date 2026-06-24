import { NextRequest, NextResponse } from "next/server";

import type { BrainDocument, ChatMessage } from "../../../lib/types";

type BrainChatRequest = {
  prompt?: string;
  documents?: BrainDocument[];
  messages?: ChatMessage[];
  writeMode?: boolean;
};

const fieldText = (document: BrainDocument, key: string) => String(document.fields[key] ?? "");
const fieldNumber = (document: BrainDocument, key: string) => Number(document.fields[key] ?? 0);

const compactDocument = (document: BrainDocument) => {
  if (document.type === "employee") {
    return {
      id: document.id,
      type: document.type,
      name: fieldText(document, "name"),
      status: fieldText(document, "status"),
      currentSalaryRaw: fieldText(document, "currentSalaryRaw"),
      monthlySalaryInr: fieldNumber(document, "monthlySalaryInr"),
      dateOfJoining: fieldText(document, "dateOfJoining"),
      dateOfLeaving: fieldText(document, "dateOfLeaving"),
      panCardStatus: fieldText(document, "panCardStatus"),
      aadhaarCardStatus: fieldText(document, "aadhaarCardStatus"),
      bankDetailsStatus: fieldText(document, "bankDetailsStatus")
    };
  }

  if (document.type === "lead") {
    return {
      id: document.id,
      type: document.type,
      company: fieldText(document, "company"),
      contactPerson: fieldText(document, "contactPerson"),
      stage: fieldText(document, "stage"),
      projectDetails: fieldText(document, "projectDetails"),
      contractValue: fieldText(document, "contractValue"),
      potentialValueInr: fieldNumber(document, "potentialValueInr"),
      communicationStatus: fieldText(document, "communicationStatus"),
      nextSteps: fieldText(document, "nextSteps"),
      deadline: fieldText(document, "deadline"),
      lastCommunicationDate: fieldText(document, "lastCommunicationDate")
    };
  }

  if (document.type === "project") {
    return {
      id: document.id,
      type: document.type,
      title: document.title,
      status: document.status,
      owner: document.owner,
      health: fieldText(document, "health"),
      risk: fieldText(document, "risk"),
      progress: fieldNumber(document, "progress"),
      dueDate: fieldText(document, "dueDate"),
      budgetInr: fieldNumber(document, "budgetInr")
    };
  }

  return {
    id: document.id,
    type: document.type,
    title: document.title,
    status: document.status,
    owner: document.owner,
    updatedAt: document.updatedAt,
    fields: document.fields
  };
};

const extractGeminiText = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = payload as {
    candidates?: Array<{
      finishReason?: string;
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return (
    response.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((item) => item.text ?? "")
      .filter(Boolean)
      .join("\n") ?? ""
  );
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Gemini API key is missing. Add GEMINI_API_KEY to .env.local, restart the server, and ask Enxt Brain again."
      },
      { status: 500 }
    );
  }

  const body = (await request.json()) as BrainChatRequest;
  const prompt = body.prompt?.trim();
  const documents = body.documents ?? [];

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const companyMemory = documents.map(compactDocument);
  const recentMessages = (body.messages ?? []).slice(-8).map((message) => ({
    role: message.role,
    content: message.content
  }));
  const isLongListRequest = /\b(all|list|show|export|contacts?|everyone|complete)\b/i.test(prompt);

  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
  let apiResponse: Response;

  try {
    apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text:
                  "You are Enxt Brain, the private AI company brain for Enxt AI's founder. Answer only from the provided company memory. Be direct, operational, and specific. When asked for lists, compute from the JSON fields and return the complete list. For CRM contact lists, format each item as `Name - Company - Stage`, one item per line, with no extra commentary after the list. For employee salary questions, use monthlySalaryInr and format each result as `Name - salary INR - status`, one employee per line. Do not use tables. Do not add unfinished parentheses. If there are no matches, say so clearly. If the founder asks to edit, move, add, or update records, explain the intended change clearly and ask for approval unless the portal has already provided an explicit update action. Never invent employees, salaries, leads, clients, or project facts that are not in memory."
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: JSON.stringify({
                    founderQuestion: prompt,
                    writeMode: Boolean(body.writeMode),
                    recentMessages,
                    companyMemory
                  })
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: isLongListRequest ? 8192 : 2048,
            temperature: 0.2,
            thinkingConfig: {
              thinkingLevel: isLongListRequest ? "minimal" : "low"
            }
          }
        })
      }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Gemini API request could not reach Google. Check network access for the Next.js server and try again."
      },
      { status: 502 }
    );
  }

  const payload = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        error:
          payload?.error?.message ??
          "Gemini could not answer right now. Check your API key, model access, and server logs."
      },
      { status: apiResponse.status }
    );
  }

  const answer = extractGeminiText(payload).trim();
  const finishReason = payload?.candidates?.[0]?.finishReason;

  return NextResponse.json({
    answer:
      finishReason === "MAX_TOKENS"
        ? `${answer}\n\nThe model stopped because it hit the output limit. Ask me to continue if you need the rest.`
        : answer || "I could not produce an answer from the current company memory."
  });
}
