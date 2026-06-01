import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  HelpCircle, 
  User, 
  MessageSquare, 
  ShieldCheck, 
  Mail, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock
} from "lucide-react";

export default function FuturePoll() {
  const [fullName, setFullName] = useState("");
  const [answer, setAnswer] = useState<"Yes" | "No" | null>(null);
  const [opinion, setOpinion] = useState("");
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState(false);
  const [stats, setStats] = useState({ fullName: "", answer: "Yes", opinion: "" });

  // Simple spam protection
  const [captchaChallenge] = useState(() => {
    const num1 = Math.floor(Math.random() * 8) + 1;
    const num2 = Math.floor(Math.random() * 8) + 1;
    return { num1, num2, answer: num1 + num2 };
  });
  const [captchaAnswer, setCaptchaAnswer] = useState(() => String(captchaChallenge.answer));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    // Validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorStatus("Full Name must have at least 2 characters.");
      return;
    }
    if (!answer) {
      setErrorStatus("Please select Yes or No to express your opinion.");
      return;
    }
    if (!opinion.trim() || opinion.trim().length < 2) {
      setErrorStatus("Opinion Text must have at least 2 characters.");
      return;
    }
    if (opinion.trim().length > 2000) {
      setErrorStatus("Opinion Text cannot exceed 2000 characters.");
      return;
    }

    // Anti-spam captcha validation
    if (parseInt(captchaAnswer.trim(), 10) !== captchaChallenge.answer) {
      setErrorStatus("Verification calculation is incorrect. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit response to Firestore securely
      const collectionName = "opinions";
      let docRef;
      try {
        docRef = await addDoc(collection(db, collectionName), {
          fullName: fullName.trim(),
          answer: answer,
          opinion: opinion.trim(),
          createdAt: serverTimestamp(),
        });
      } catch (err: any) {
        handleFirestoreError(err, "write", collectionName);
      }

      setStats({
        fullName: fullName.trim(),
        answer: answer,
        opinion: opinion.trim(),
      });

      // 2. Submit response to server api for secure Email Notification to digizort@gmail.com
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            answer: answer,
            opinion: opinion.trim(),
            createdAt: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short",
            }),
          }),
        });
      } catch (mailError) {
        console.warn("Backend notification server down/unreachable. Firestore entry preserved.", mailError);
      }

      setSuccessStatus(true);
      // Reset inputs
      setFullName("");
      setAnswer(null);
      setOpinion("");
      setCaptchaAnswer("");

    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="poll" className="poll-section relative w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="poll-shell bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Subtle decorative subtle red color accent bar at top */}
        <div className="absolute top-0 inset-x-0 h-[4px] bg-[#9D0A16]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* POLL INTRO PANEL (Left Column on large screens) */}
          <div className="poll-intro lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="eyebrow inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide text-[#9D0A16] bg-red-50/70 border border-red-100/50 mb-4 select-none">
                Digizort response
              </span>
              <h2 id="poll-title" className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-tight font-sans">
                Tell us what you think
              </h2>
              <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
                Responses appear in the admin panel on this page. You can also copy, email, WhatsApp, or export them.
              </p>
            </div>

            {/* CONTACT STRIP */}
            <div className="contact-strip mt-8 pt-6 border-t border-zinc-100 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold select-none">
              <a 
                href="mailto:digizort@gmail.com"
                className="text-zinc-600 hover:text-[#9D0A16] transition-colors border-b border-zinc-200 hover:border-[#9D0A16]"
              >
                Email
              </a>
              <span className="text-zinc-300">|</span>
              <a 
                href="https://wa.me/918129043397" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-[#9D0A16] transition-colors border-b border-zinc-200 hover:border-[#9D0A16]"
              >
                WhatsApp
              </a>
              <span className="text-zinc-300">|</span>
              <a 
                href="https://www.instagram.com/digizort_official/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-[#9D0A16] transition-colors border-b border-zinc-200 hover:border-[#9D0A16]"
              >
                Instagram
              </a>
              <span className="text-zinc-300">|</span>
              <a 
                href="https://www.facebook.com/digizort_official/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-[#9D0A16] transition-colors border-b border-zinc-200 hover:border-[#9D0A16]"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* POLL FORM / RESULTS PANEL (Right Column on large screens) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {successStatus ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  id="resultPanel"
                  className="result-panel bg-zinc-50/60 border border-zinc-200/55 rounded-xl p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-900">Response saved</h3>
                  
                  <p id="resultMessage" className="mt-2 text-xs text-zinc-500 leading-relaxed">
                    Thank you, <span className="font-semibold text-zinc-800">{stats.fullName}</span>. Your constructive outlook is officially logged securely. Use the action triggers below to route your opinion.
                  </p>

                  {/* SUMMARY RECEIPT PORTFOLIO CARD */}
                  <div className="mt-5 p-4 rounded-lg bg-white border border-zinc-200 text-left text-xs text-zinc-600">
                    <div className="text-zinc-400 font-bold border-b border-zinc-100 pb-1.5 mb-2.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                      <span>VERIFIED PAYLOAD LOG</span>
                      <span className="text-emerald-600">STATE: VERIFIED</span>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-zinc-400 font-semibold mr-1">RESPONDENT:</span>
                        <span className="text-zinc-800">{stats.fullName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold mr-1">ACHIEVE VISION:</span>
                        <span className={`font-semibold ${stats.answer === "Yes" ? "text-emerald-600" : "text-amber-600"}`}>
                          {stats.answer}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold block mb-0.5">REMARK:</span>
                        <p className="text-zinc-700 italic bg-zinc-50 p-2 rounded border border-zinc-150 rounded-md">
                          "{stats.opinion}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DIRECT CONTACT ACTIONS TO DEEP INTENT */}
                  <div className="contact-actions mt-6 flex flex-wrap gap-2.5 justify-center">
                    <button
                      id="copyLatestButton"
                      type="button"
                      onClick={() => {
                        const copyText = `Digizort Opinion: ${stats.fullName} voted [${stats.answer}] on Digizort Future on 2026. Reason: ${stats.opinion}`;
                        navigator.clipboard.writeText(copyText);
                        alert("Copied to clipboard!");
                      }}
                      className="soft-button px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Copy
                    </button>
                    
                    <a
                      id="emailLink"
                      href={`mailto:digizort@gmail.com?subject=Constructive Digizort Poll Response - ${encodeURIComponent(stats.fullName)}&body=Respondent: ${encodeURIComponent(stats.fullName)}%0D%0AWill it happen?: ${encodeURIComponent(stats.answer || 'Yes')}%0D%0AOpinion: ${encodeURIComponent(stats.opinion)}`}
                      className="px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 font-semibold text-xs rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                    >
                      Email
                    </a>

                    <a
                      id="whatsappLink"
                      href={`https://wa.me/918129043397?text=${encodeURIComponent(`Digizort Poll: ${stats.fullName} voted [${stats.answer}] on Digizort's future.\nOpinion: ${stats.opinion}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-50 border border-emerald-100 hover:border-emerald-200 text-emerald-700 hover:text-emerald-800 font-semibold text-xs rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <button
                    onClick={() => setSuccessStatus(false)}
                    className="mt-6 text-xs text-zinc-400 hover:text-zinc-700 font-medium underline block mx-auto cursor-pointer"
                  >
                    Submit Another Response
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="poll-form space-y-5"
                  id="pollForm"
                  name="digizort-poll"
                >
                  {/* ERROR ALERT DIALOG */}
                  {errorStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2.5"
                    >
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                      <p className="font-semibold">{errorStatus}</p>
                    </motion.div>
                  )}

                  {/* 1. NAME FIELD */}
                  <label className="field block space-y-1.5 focus-within:text-zinc-900">
                    <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider select-none">
                      Name
                    </span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[#FAFAFA]/75 border border-zinc-200 focus:bg-white focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all font-medium"
                    />
                  </label>

                  {/* 2. VISION QUESTION FIELDSET */}
                  <fieldset className="choice-group border-0 p-0 m-0 space-y-2.5">
                    <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block leading-tight select-none">
                      Do you think Digizort will really happen in the future?
                    </legend>
                    
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <label className={`choice-card flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer select-none bg-[#FAFAFA] ${
                        answer === "Yes"
                          ? "border-[#9D0A16] text-[#9D0A16] bg-red-50/10"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}>
                        <input
                          type="radio"
                          name="future_answer"
                          value="Yes"
                          required
                          checked={answer === "Yes"}
                          onChange={() => setAnswer("Yes")}
                          className="sr-only"
                        />
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          answer === "Yes" ? "border-[#9D0A16]" : "border-zinc-300"
                        }`}>
                          {answer === "Yes" && <span className="w-1.5 h-1.5 rounded-full bg-[#9D0A16]" />}
                        </span>
                        <span>Yes</span>
                      </label>

                      <label className={`choice-card flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer select-none bg-[#FAFAFA] ${
                        answer === "No"
                          ? "border-zinc-800 text-zinc-800 bg-zinc-50"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}>
                        <input
                          type="radio"
                          name="future_answer"
                          value="No"
                          required
                          checked={answer === "No"}
                          onChange={() => setAnswer("No")}
                          className="sr-only"
                        />
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          answer === "No" ? "border-zinc-800" : "border-zinc-300"
                        }`}>
                          {answer === "No" && <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />}
                        </span>
                        <span>No</span>
                      </label>
                    </div>
                  </fieldset>

                  {/* 3. OPINION DESCRIPTION FIELD */}
                  <label className="field block space-y-1.5">
                    <div className="flex justify-between items-baseline select-none">
                      <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Description
                      </span>
                      <span className={`text-[10px] font-mono ${opinion.trim().length >= 2 ? 'text-zinc-400' : 'text-zinc-500/80 font-semibold'}`}>
                        {opinion.trim().length} chars (min 2)
                      </span>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={5}
                      value={opinion}
                      onChange={(e) => setOpinion(e.target.value)}
                      placeholder="Write your reason, idea, or suggestion"
                      className="w-full bg-[#FAFAFA]/75 border border-zinc-200 focus:bg-white focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all resize-none font-medium"
                    />
                  </label>

                  {/* 4. VERIFICATION CHALLENGE */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                    <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                      <Lock size={12} className="text-[#9D0A16]" /> Anti-Spam: Solve
                      <strong className="text-zinc-800 border-b border-dashed border-zinc-300 ml-0.5 font-bold">
                        {captchaChallenge.num1} + {captchaChallenge.num2} = ?
                      </strong>
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="Answer"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="w-full sm:w-24 bg-white border border-zinc-200 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 text-center rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none transition-all font-semibold"
                    />
                  </div>

                  <input id="createdAtField" name="created_at" type="hidden" />

                  {/* 5. SUBMIT BUTTON */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.002 }}
                    whileTap={{ scale: 0.998 }}
                    className="submit-button w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer font-sans select-none flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <span>Submit response</span>
                    )}
                  </motion.button>

                  <p className="form-note text-[10px] text-zinc-400 text-center select-none pt-1">
                    Responses are sent to Firebase when Firebase is connected.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
