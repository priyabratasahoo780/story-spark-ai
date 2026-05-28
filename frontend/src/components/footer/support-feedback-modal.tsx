import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type SupportFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SupportFeedbackFormState = {
  name: string;
  email: string;
  feedbackType: "bug" | "feature" | "feedback" | "general";
  subject: string;
  message: string;
};

const DEFAULT_GITHUB_ISSUES_URL = "https://github.com/ronisarkarexe/story-spark-ai/issues";

const INITIAL_FORM_STATE: SupportFeedbackFormState = {
  name: "",
  email: "",
  feedbackType: "general",
  subject: "",
  message: "",
};

const FEEDBACK_TYPE_OPTIONS: Array<{ label: string; value: SupportFeedbackFormState["feedbackType"] }> = [
  { label: "Bug report", value: "bug" },
  { label: "Feature request", value: "feature" },
  { label: "General feedback", value: "feedback" },
  { label: "Support request", value: "general" },
];

const SupportFeedbackModal = ({ isOpen, onClose }: SupportFeedbackModalProps) => {
  const [formData, setFormData] = useState<SupportFeedbackFormState>(INITIAL_FORM_STATE);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFormData(INITIAL_FORM_STATE);
      setStatus("idle");
      setMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedName = formData.name.trim();

    if (!trimmedSubject || !trimmedMessage) {
      setStatus("error");
      setMessage("Subject and message are required.");
      return;
    }

    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmedEmail)) {
        setStatus("error");
        setMessage("Please enter a valid email address.");
        return;
      }
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          feedbackType: formData.feedbackType,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("success");
      setMessage(data.message || "Thanks for reaching out. We received your message.");
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Network error. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#081022] text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-feedback-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.24),transparent_70%)]"
        />

        <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-blue-300/80">Feedback</p>
            <h2 id="support-feedback-title" className="mt-2 text-2xl font-semibold text-white">
              Share your feedback with the team
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300/80">
              Tell us about bugs, feature ideas, or anything that could improve your experience. GitHub Issues remains available for advanced reporting.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close support form"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
            <div className="sm:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400" htmlFor="support-name">
                Name
              </label>
              <input
                id="support-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400" htmlFor="support-email">
                Email
              </label>
              <input
                id="support-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400" htmlFor="feedback-type">
                Feedback type
              </label>
              <select
                id="feedback-type"
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
              >
                {FEEDBACK_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#081022] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400" htmlFor="support-subject">
                Subject
              </label>
              <input
                id="support-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What would you like to tell us?"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400" htmlFor="support-message">
                Message
              </label>
              <textarea
                id="support-message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                placeholder="Share details, reproduction steps, or suggestions. Screenshots/logs can be added in the future."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm leading-6 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-400">
                Optional GitHub reporting is still available if you prefer to open an issue directly.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <a
                  href={DEFAULT_GITHUB_ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                >
                  GitHub Issues
                </a>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Sending..." : "Send feedback"}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 min-h-[24px]">
              {status === "success" && <p className="text-sm text-emerald-400">{message}</p>}
              {status === "error" && <p className="text-sm text-red-400">{message}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportFeedbackModal;