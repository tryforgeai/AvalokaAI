import { Copy, Download, Moon, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { crisisFallback } from "./data/responseLibrary";
import { isCrisisMessage } from "./lib/crisisGate";
import { mapDukkha } from "./lib/dukkhaMapper";
import { buildDukkhaResponse } from "./lib/dukkhaResponse";
import { buildGuardedResponse } from "./lib/guardedResponse";
import { applyAvalokaV2Result, createInitialLlmDebugState } from "./lib/llmPipeline";
import { requestAvalokaV2 } from "./lib/orchestratorClient";
import { selectScenario } from "./lib/responseSelector";
import { requestSageMemoryWriter } from "./lib/sageMemoryClient";
import { getVisibleBaifaResult } from "./lib/visibleDebug";
import { isDeveloperMode } from "./lib/uiMode";
import {
  clearAvalokaData,
  exportAvalokaData,
  hasConsent,
  loadFeedback,
  loadMessages,
  saveConsent,
  saveFeedback,
  saveMemoryCandidates,
  saveMessages,
} from "./lib/storage";
import type { BaifaMindState, ChatMessage, CompassionMove, FeedbackEntry, MemoryCandidate, MemoryGuardianResult } from "./types";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const developerMode = isDeveloperMode(window.location.search);
  const [consented, setConsented] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [input, setInput] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [exportText, setExportText] = useState("");
  const [exportStatus, setExportStatus] = useState("");

  useEffect(() => {
    setConsented(hasConsent());
    setMessages(loadMessages());
    setFeedback(loadFeedback());
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveFeedback(feedback);
  }, [feedback]);

  const latestAvalokaMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "avaloka"),
    [messages],
  );
  const latestDebugMessage = latestAvalokaMessage;
  const latestVisibleBaifa = getVisibleBaifaResult(latestDebugMessage);

  function acceptConsent() {
    saveConsent();
    setConsented(true);
  }

  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: makeId("user"),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    const crisis = isCrisisMessage(text);
    const scenario = selectScenario(text);
    const dukkha = crisis ? undefined : mapDukkha(text);
    const dukkhaResponse = dukkha ? buildDukkhaResponse(dukkha, text) : undefined;
    const responseLines = crisis ? crisisFallback : dukkhaResponse || scenario.response;
    const guardedResponse = buildGuardedResponse(responseLines, { crisis });
    const avalokaMessage: ChatMessage = {
      id: makeId("avaloka"),
      role: "avaloka",
      text: guardedResponse.text,
      scenarioId: crisis ? "crisis" : dukkhaResponse ? `dukkha:${dukkha?.responseMoves[0]}` : scenario.id,
      createdAt: new Date().toISOString(),
      crisis,
      guardianFallback: guardedResponse.guardianFallback,
      preceptsSeverity: guardedResponse.precepts?.severity,
      preceptsViolations: guardedResponse.precepts?.violations.map((violation) => violation.precept),
      dukkhaTypes: dukkha?.dukkhaTypes,
      dukkhaPatterns: dukkha?.patterns,
      responseMoves: dukkha?.responseMoves,
      responseSource: "local",
      localBaselineText: guardedResponse.text,
      ...createInitialLlmDebugState(crisis),
    };

    setMessages((current) => [...current, userMessage, avalokaMessage]);
    setActiveMessageId(avalokaMessage.id);
    setInput("");

    requestAvalokaV2({
      userText: text,
      localText: guardedResponse.text,
      localCrisis: crisis,
      dukkhaTypes: dukkha?.dukkhaTypes,
      dukkhaPatterns: dukkha?.patterns,
      responseMoves: dukkha?.responseMoves,
    }).then((orchestratorV2) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === avalokaMessage.id ? applyAvalokaV2Result(message, orchestratorV2) : message,
        ),
      );
    });
  }

  function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeMessageId) return;
    const avalokaMessageId = activeMessageId;

    const formData = new FormData(event.currentTarget);
    const entry: FeedbackEntry = {
      id: makeId("feedback"),
      messageId: activeMessageId,
      createdAt: new Date().toISOString(),
      realLowMoment: String(formData.get("realLowMoment")) as FeedbackEntry["realLowMoment"],
      openedUnprompted: String(formData.get("openedUnprompted")) as FeedbackEntry["openedUnprompted"],
      settlingScore: Number(formData.get("settlingScore") || 3),
      mostHelpfulLine: String(formData.get("mostHelpfulLine") || ""),
      failedLine: String(formData.get("failedLine") || ""),
      wantsTomorrow: String(formData.get("wantsTomorrow")) as FeedbackEntry["wantsTomorrow"],
    };

    setFeedback((current) => [...current, entry]);
    if (developerMode) {
      const avalokaIndex = messages.findIndex((message) => message.id === avalokaMessageId && message.role === "avaloka");
      const avalokaMessage = messages[avalokaIndex];
      const userMessage = messages
        .slice(0, avalokaIndex)
        .reverse()
        .find((message) => message.role === "user");

      if (userMessage && avalokaMessage) {
        setMessages((current) =>
          current.map((message) =>
            message.id === avalokaMessage.id
              ? { ...message, sageMemory: { status: "loading", candidates: [], guardian: [] } }
              : message,
          ),
        );

        requestSageMemoryWriter({
          turn: {
            userMessageId: userMessage.id,
            avalokaMessageId: avalokaMessage.id,
            userText: userMessage.text,
            avalokaText: avalokaMessage.text,
          },
          feedback: entry,
        }).then((sageMemory) => {
          if (sageMemory.status === "ready" && sageMemory.candidates.length > 0) {
            saveMemoryCandidates(sageMemory.candidates);
          }

          setMessages((current) =>
            current.map((message) => (message.id === avalokaMessage.id ? { ...message, sageMemory } : message)),
          );
        });
      }
    }
    setActiveMessageId(null);
    event.currentTarget.reset();
  }

  function downloadData() {
    const blob = new Blob([exportAvalokaData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `avaloka-v1-feedback-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportText(exportAvalokaData());
    setExportStatus("如果浏览器没有下载文件，可以复制下面的 JSON。");
  }

  async function copyExportData() {
    const data = exportAvalokaData();
    setExportText(data);

    try {
      await navigator.clipboard.writeText(data);
      setExportStatus("已复制导出 JSON。");
    } catch {
      setExportStatus("当前浏览器不能自动复制，请手动复制下面的 JSON。");
    }
  }

  function clearData() {
    const confirmed = window.confirm("确定清空当前浏览器里的 Avaloka 对话、反馈和本地记忆记录吗？这个操作不能撤销。");
    if (!confirmed) return;

    clearAvalokaData();
    setMessages([]);
    setFeedback([]);
    setActiveMessageId(null);
    setExportText("");
    setExportStatus("");
  }

  if (!consented) {
    return (
      <main className="shell consent-shell">
        <section className="consent-panel">
          <div className="brand-mark">
            <Moon aria-hidden="true" size={22} />
            <span>Avaloka V1</span>
          </div>
          <h1>低谷时刻，先稳住这一分钟。</h1>
          <p>
            Avaloka 是私人情绪安顿陪伴，不是心理治疗、医疗建议或危机服务。
            如果你处在即时危险中，请联系身边可信任的人、当地紧急服务、医生或危机热线。
          </p>
          <p>
            这个本地 MVP 会把对话和反馈保存在当前浏览器里，用于 7 天测试记录。你可以导出或清空记录。
          </p>
          <button className="primary-button" onClick={acceptConsent}>
            <ShieldCheck size={18} />
            我理解，进入 Avaloka
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Avaloka V1</p>
            <h1>安静地接住这一刻</h1>
          </div>
          <div className="toolbar">
            {developerMode ? <span className="mode-pill">Dev</span> : null}
            <button className="icon-button" onClick={downloadData} title="导出记录">
              <Download size={18} />
            </button>
            <button className="icon-button" onClick={copyExportData} title="复制导出 JSON">
              <Copy size={18} />
            </button>
            <button className="icon-button" onClick={clearData} title="清空本地记录">
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        <section className="chat-panel" aria-label="Avaloka chat">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>可以只写一句。</p>
              <span>比如：我现在胸口很紧，不想跟家里人说。</span>
            </div>
          ) : (
            messages.map((message) => (
              <article
                className={`message ${message.role === "user" ? "user-message" : "avaloka-message"} ${
                  message.crisis ? "crisis-message" : ""
                } ${message.orchestratorV2?.status === "loading" ? "message-loading" : ""}`}
                key={message.id}
              >
                <span>{message.role === "user" ? "你" : "Avaloka"}</span>
                <p>{message.text}</p>
                {message.role === "avaloka" && message.orchestratorV2?.status === "loading" ? (
                  <small className="message-status">正在让回应更贴近你这一刻...</small>
                ) : null}
                {message.role === "avaloka" && message.orchestratorV2?.status === "error" ? (
                  <small className="message-status">当前先使用本地备用回应。</small>
                ) : null}
              </article>
            ))
          )}
        </section>

        <section className="composer" aria-label="Write to Avaloka">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="把这一刻写下来。不需要完整。"
            rows={3}
          />
          <button className="send-button" onClick={sendMessage}>
            <Send size={18} />
            发送
          </button>
        </section>
      </section>

      <aside className="feedback-panel">
        <div className="feedback-card">
          <p className="eyebrow">小记录</p>
          <h2>留一笔小记录</h2>
          {latestAvalokaMessage && activeMessageId ? (
            <form onSubmit={submitFeedback}>
              <label>
                现在有没有稳一点？<strong>1-5</strong>
                <input name="settlingScore" type="range" min="1" max="5" defaultValue="4" />
              </label>
              <label>
                明天还想继续吗？
                <select name="wantsTomorrow" defaultValue="yes">
                  <option value="yes">想继续</option>
                  <option value="no">不想</option>
                  <option value="unsure">不确定</option>
                </select>
              </label>
              <details className="feedback-details">
                <summary>补充记录</summary>
                <label>
                  这是真实低谷吗？
                  <select name="realLowMoment" defaultValue="yes">
                    <option value="yes">是</option>
                    <option value="no">不是，只是测试</option>
                    <option value="unsure">不确定</option>
                  </select>
                </label>
                <label>
                  是主动打开的吗？
                  <select name="openedUnprompted" defaultValue="yes">
                    <option value="yes">是</option>
                    <option value="no">不是，被提醒后打开</option>
                    <option value="unsure">不确定</option>
                  </select>
                </label>
                <label>
                  最有帮助的一句话
                  <input name="mostHelpfulLine" placeholder="可以留空" />
                </label>
                <label>
                  哪一句冷、泛泛、不对或不安全？
                  <input name="failedLine" placeholder="可以留空" />
                </label>
              </details>
              <button className="primary-button" type="submit">
                保存反馈
              </button>
            </form>
          ) : (
            <p className="soft-note">
              发送一次对话后，这里会出现很短的记录。当前已保存 {feedback.length} 条反馈。
            </p>
          )}
        </div>

        <div className="privacy-card">
          <p className="eyebrow">隐私</p>
          <p className="soft-note">这些记录只保存在当前浏览器里。你可以随时导出，或在准备好时清空。</p>
        </div>

        {developerMode ? (
          <>
            <div className="debug-card" aria-label="Internal debug panel">
          <p className="eyebrow">Internal Debug</p>
          <h2>Local testing only</h2>
          {latestDebugMessage ? (
            <dl>
              <dt>scenarioId</dt>
              <dd>{latestDebugMessage.scenarioId || "none"}</dd>
              <dt>dukkhaTypes</dt>
              <dd>{formatDebugList(latestDebugMessage.dukkhaTypes)}</dd>
              <dt>patterns</dt>
              <dd>{formatDebugList(latestDebugMessage.dukkhaPatterns)}</dd>
              <dt>responseMoves</dt>
              <dd>{formatDebugList(latestDebugMessage.responseMoves)}</dd>
              <dt>guardian</dt>
              <dd>
                {latestDebugMessage.guardianFallback ? "fallback" : "pass"} /{" "}
                {latestDebugMessage.preceptsSeverity || "n/a"}
              </dd>
              <dt>source</dt>
              <dd>{latestDebugMessage.responseSource || "local"}</dd>
            </dl>
          ) : (
            <p className="soft-note">No Avaloka message yet.</p>
          )}
            </div>

            <div className="baseline-card" aria-label="Local baseline panel">
          <p className="eyebrow">Local Baseline</p>
          <h2>Developer testing only</h2>
          {latestDebugMessage?.localBaselineText ? (
            <p className="baseline-text">{latestDebugMessage.localBaselineText}</p>
          ) : (
            <p className="soft-note">No local baseline yet.</p>
          )}
            </div>

            <div className="orchestrator-card" aria-label="LLM orchestrator V2 panel">
          <p className="eyebrow">LLM Orchestrator V2</p>
          <h2>Developer testing only</h2>
          {latestDebugMessage?.orchestratorV2 ? (
            <div className="orchestrator-body">
              <dl>
                <dt>status</dt>
                <dd>{latestDebugMessage.orchestratorV2.status}</dd>
                <dt>model</dt>
                <dd>{latestDebugMessage.orchestratorV2.model || "n/a"}</dd>
                <dt>latency</dt>
                <dd>
                  {latestDebugMessage.orchestratorV2.latencyMs
                    ? `${latestDebugMessage.orchestratorV2.latencyMs}ms`
                    : "n/a"}
                </dd>
                <dt>crisis</dt>
                <dd>{latestDebugMessage.orchestratorV2.crisis?.status || "n/a"}</dd>
                <dt>guardian</dt>
                <dd>
                  {latestDebugMessage.orchestratorV2.guardian?.passed ? "pass" : "fallback"} /{" "}
                  {latestDebugMessage.orchestratorV2.guardian?.severity || "n/a"}
                </dd>
                <dt>repair</dt>
                <dd>{latestDebugMessage.orchestratorV2.repairAttempted ? "yes" : "no"}</dd>
              </dl>
              {latestDebugMessage.orchestratorV2.error ? (
                <p className="soft-note">{latestDebugMessage.orchestratorV2.error}</p>
              ) : null}
              {latestDebugMessage.orchestratorV2.candidateText ? (
                <p className="orchestrator-text">{latestDebugMessage.orchestratorV2.candidateText}</p>
              ) : null}
            </div>
          ) : (
            <p className="soft-note">Send a non-crisis message to run V2 orchestration.</p>
          )}
            </div>

            <div className="compassion-card" aria-label="Compassion OS planner panel">
          <p className="eyebrow">Compassion OS</p>
          <h2>Developer testing only</h2>
          {latestDebugMessage?.orchestratorV2?.compassionPlan ? (
            <div className="compassion-body">
              <dl>
                <dt>status</dt>
                <dd>{latestDebugMessage.orchestratorV2.compassionPlan.status}</dd>
                <dt>model</dt>
                <dd>{latestDebugMessage.orchestratorV2.compassionPlan.model || "n/a"}</dd>
                <dt>latency</dt>
                <dd>
                  {latestDebugMessage.orchestratorV2.compassionPlan.latencyMs
                    ? `${latestDebugMessage.orchestratorV2.compassionPlan.latencyMs}ms`
                    : "n/a"}
                </dd>
                <dt>moves</dt>
                <dd>{formatCompassionMoves(latestDebugMessage.orchestratorV2.compassionPlan.moves)}</dd>
                <dt>stance</dt>
                <dd>{latestDebugMessage.orchestratorV2.compassionPlan.stance || "n/a"}</dd>
                <dt>avoid</dt>
                <dd>{formatDebugList(latestDebugMessage.orchestratorV2.compassionPlan.avoid)}</dd>
              </dl>
              {latestDebugMessage.orchestratorV2.compassionPlan.responseHint ? (
                <p className="soft-note">{latestDebugMessage.orchestratorV2.compassionPlan.responseHint}</p>
              ) : null}
              {latestDebugMessage.orchestratorV2.compassionPlan.error ? (
                <p className="soft-note">{latestDebugMessage.orchestratorV2.compassionPlan.error}</p>
              ) : null}
            </div>
          ) : (
            <p className="soft-note">Send a message to run the Compassion OS planner inside V2.</p>
          )}
            </div>

            <div className="orchestrator-card" aria-label="SAGE memory writer panel">
          <p className="eyebrow">SAGE Memory Writer</p>
          <h2>Developer testing only</h2>
          {latestDebugMessage?.sageMemory ? (
            <div className="orchestrator-body">
              <dl>
                <dt>status</dt>
                <dd>{latestDebugMessage.sageMemory.status}</dd>
                <dt>model</dt>
                <dd>{latestDebugMessage.sageMemory.model || "n/a"}</dd>
                <dt>latency</dt>
                <dd>
                  {latestDebugMessage.sageMemory.latencyMs ? `${latestDebugMessage.sageMemory.latencyMs}ms` : "n/a"}
                </dd>
                <dt>candidates</dt>
                <dd>{formatMemoryCandidates(latestDebugMessage.sageMemory.candidates)}</dd>
                <dt>guardian</dt>
                <dd>{formatMemoryGuardian(latestDebugMessage.sageMemory.guardian)}</dd>
              </dl>
              {latestDebugMessage.sageMemory.error ? (
                <p className="soft-note">{latestDebugMessage.sageMemory.error}</p>
              ) : null}
            </div>
          ) : (
            <p className="soft-note">Save feedback on the latest Avaloka message to run the SAGE writer.</p>
          )}
            </div>

            <div className="baifa-card" aria-label="Baifa mapper panel">
          <p className="eyebrow">Baifa Mapper</p>
          <h2>Developer testing only</h2>
          {latestVisibleBaifa ? (
            <div className="baifa-body">
              <dl>
                <dt>status</dt>
                <dd>{latestVisibleBaifa.status}</dd>
                <dt>model</dt>
                <dd>{latestVisibleBaifa.model || "n/a"}</dd>
                <dt>latency</dt>
                <dd>{latestVisibleBaifa.latencyMs ? `${latestVisibleBaifa.latencyMs}ms` : "n/a"}</dd>
                <dt>states</dt>
                <dd>{formatBaifaStates(latestVisibleBaifa.baifa?.primaryMindStates)}</dd>
                <dt>antidotes</dt>
                <dd>{formatDebugList(latestVisibleBaifa.baifa?.wholesomeAntidotes)}</dd>
                <dt>moves</dt>
                <dd>{formatDebugList(latestVisibleBaifa.baifa?.recommendedResponseMoves)}</dd>
              </dl>
              {latestVisibleBaifa.error ? <p className="soft-note">{latestVisibleBaifa.error}</p> : null}
            </div>
          ) : (
            <p className="soft-note">Send a non-crisis message to see Baifa from V2 orchestration.</p>
          )}
            </div>
          </>
        ) : null}

        {exportText ? (
          <div className="export-card" aria-label="Export JSON fallback">
            <p className="eyebrow">Export JSON</p>
            <h2>导出备用</h2>
            <p className="soft-note">{exportStatus}</p>
            <textarea readOnly value={exportText} rows={8} aria-label="Exported Avaloka JSON" />
          </div>
        ) : null}
      </aside>
    </main>
  );
}

function formatDebugList(items?: string[]): string {
  if (!items || items.length === 0) return "none";
  return items.join(", ");
}

function formatBaifaStates(states?: BaifaMindState[]): string {
  if (!states || states.length === 0) return "none";
  return states.map((state) => `${state.mindState} ${Math.round(state.confidence * 100)}%`).join(", ");
}

function formatCompassionMoves(moves?: CompassionMove[]): string {
  if (!moves || moves.length === 0) return "none";
  return moves.map((move) => `${move.id} ${Math.round(move.confidence * 100)}%`).join(", ");
}

function formatMemoryCandidates(candidates?: MemoryCandidate[]): string {
  if (!candidates || candidates.length === 0) return "none";
  return candidates
    .map((candidate) => `${candidate.kind}: ${candidate.text} ${Math.round(candidate.confidence * 100)}%`)
    .join(" | ");
}

function formatMemoryGuardian(results?: MemoryGuardianResult[]): string {
  if (!results || results.length === 0) return "none";
  return results
    .map((result) => `${result.candidateId}: ${result.status}${result.reasons.length ? ` (${result.reasons.join(", ")})` : ""}`)
    .join(" | ");
}
