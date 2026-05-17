import { Download, Moon, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { crisisFallback } from "./data/responseLibrary";
import { isCrisisMessage } from "./lib/crisisGate";
import { selectScenario } from "./lib/responseSelector";
import {
  clearAvalokaData,
  exportAvalokaData,
  hasConsent,
  loadFeedback,
  loadMessages,
  saveConsent,
  saveFeedback,
  saveMessages,
} from "./lib/storage";
import type { ChatMessage, FeedbackEntry } from "./types";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [consented, setConsented] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [input, setInput] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

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
    const responseLines = crisis ? crisisFallback : scenario.response;
    const avalokaMessage: ChatMessage = {
      id: makeId("avaloka"),
      role: "avaloka",
      text: responseLines.join("\n\n"),
      scenarioId: crisis ? "crisis" : scenario.id,
      createdAt: new Date().toISOString(),
      crisis,
    };

    setMessages((current) => [...current, userMessage, avalokaMessage]);
    setActiveMessageId(avalokaMessage.id);
    setInput("");
  }

  function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeMessageId) return;

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
  }

  function clearData() {
    clearAvalokaData();
    setMessages([]);
    setFeedback([]);
    setActiveMessageId(null);
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
            <button className="icon-button" onClick={downloadData} title="导出记录">
              <Download size={18} />
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
                }`}
                key={message.id}
              >
                <span>{message.role === "user" ? "你" : "Avaloka"}</span>
                <p>{message.text}</p>
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
          <p className="eyebrow">7 天记录</p>
          <h2>这次有没有让你稳一点？</h2>
          {latestAvalokaMessage && activeMessageId ? (
            <form onSubmit={submitFeedback}>
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
                安顿评分：<strong>1-5</strong>
                <input name="settlingScore" type="range" min="1" max="5" defaultValue="4" />
              </label>
              <label>
                最有帮助的一句话
                <input name="mostHelpfulLine" placeholder="可以留空" />
              </label>
              <label>
                哪一句冷、泛泛、不对或不安全？
                <input name="failedLine" placeholder="可以留空" />
              </label>
              <label>
                明天还想继续吗？
                <select name="wantsTomorrow" defaultValue="yes">
                  <option value="yes">想继续</option>
                  <option value="no">不想</option>
                  <option value="unsure">不确定</option>
                </select>
              </label>
              <button className="primary-button" type="submit">
                保存反馈
              </button>
            </form>
          ) : (
            <p className="soft-note">
              发送一次对话后，这里会出现轻量反馈表。当前已保存 {feedback.length} 条反馈。
            </p>
          )}
        </div>
      </aside>
    </main>
  );
}
