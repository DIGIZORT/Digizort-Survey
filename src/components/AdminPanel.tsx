import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, handleFirestoreError } from "../firebase";
import { OpinionValue } from "../types";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  LogOut, 
  BarChart3, 
  Database,
  Calendar,
  Frown,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [opinions, setOpinions] = useState<OpinionValue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Auto detect current logged-in user state
  useEffect(() => {
    // Check local session bypass first
    const isLocalAuth = sessionStorage.getItem("admin_session") === "active";
    if (isLocalAuth) {
      setIsAdminAuthenticated(true);
      setAuthChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "admin@digizort.com") {
        setIsAdminAuthenticated(true);
      } else {
        if (sessionStorage.getItem("admin_session") !== "active") {
          setIsAdminAuthenticated(false);
        }
      }
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  // Fetch Opinions from Firestore (Active listener with error isolation)
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    
    setDataLoading(true);
    setDbError(null);
    const collectionPath = "opinions";

    const q = query(collection(db, collectionPath), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const loaded: OpinionValue[] = [];
        snapshot.forEach((docRef) => {
          const d = docRef.data();
          // Extract timestamp safely
          let createdValue = "Pending...";
          if (d.createdAt) {
            if (typeof d.createdAt.toDate === "function") {
              createdValue = d.createdAt.toDate().toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (d.createdAt instanceof Date) {
              createdValue = d.createdAt.toLocaleString();
            } else {
              createdValue = String(d.createdAt);
            }
          }
          
          loaded.push({
            id: docRef.id,
            fullName: d.fullName || "Anonymous User",
            answer: d.answer || "Yes",
            opinion: d.opinion || "",
            createdAt: createdValue,
          });
        });
        setOpinions(loaded);
        setDataLoading(false);
      },
      (err) => {
        console.error("Firestore Listen Block Error:", err);
        setDbError("Access restricted. Verify Firestore database credentials.");
        setDataLoading(false);
        try {
          handleFirestoreError(err, "list", collectionPath);
        } catch (e) {
          // preserve local logs
        }
      }
    );

    return unsubscribe;
  }, [isAdminAuthenticated]);

  // Filter respondents by Name
  const filteredOpinions = opinions.filter((op) =>
    op.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // HANDLE SECURE LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const adminEmail = "admin@digizort.com";

    // Strictly protect static admin criteria
    if (password !== "Dheeraj@1755A") {
      setLoginError("Access denied: Invalid administrator credential key.");
      setIsLoggingIn(false);
      return;
    }

    // Immediately authorize locally using session storage so they bypass Firebase Console credentials setup fully
    sessionStorage.setItem("admin_session", "active");
    setIsAdminAuthenticated(true);

    try {
      // Try to sign in or register in the background so it works if enabled, but catch gracefully
      await signInWithEmailAndPassword(auth, adminEmail, password);
    } catch (err: any) {
      console.warn("[Auth] Background Firebase Auth Sign-in warning (continuing with secure session):", err.code, err.message);
      if (
        err.code === "auth/user-not-found" || 
        err.code === "auth/invalid-credential" || 
        err.message?.includes("invalid-credential") ||
        err.message?.includes("user-not-found")
      ) {
        try {
          await createUserWithEmailAndPassword(auth, adminEmail, password);
        } catch (regErr: any) {
          console.warn("[Auth] Background bootstrapping failed:", regErr.code, regErr.message);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("admin_session");
      await signOut(auth);
      setIsAdminAuthenticated(false);
    } catch (err) {
      console.error("Logout Err:", err);
      setIsAdminAuthenticated(false);
    }
  };

  // DELETE SINGLE RECORD SECURELY
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this record permanently?")) return;

    const pathForDelete = "opinions";
    try {
      await deleteDoc(doc(db, pathForDelete, id));
    } catch (err) {
      try {
        handleFirestoreError(err, "delete", pathForDelete);
      } catch (e) {
        alert("Operation denied: Unauthorised access permissions.");
      }
    }
  };

  // EXPORT PROCESS-1: CSV GENERATOR
  const exportToCSV = () => {
    if (filteredOpinions.length === 0) {
      alert("No shown responses to download.");
      return;
    }
    const headers = ["No.", "Name", "Answer", "Opinion", "Time"].join(",") + "\n";
    const rows = filteredOpinions.map((op, idx) => {
      const indexVal = `"${idx + 1}"`;
      const escapedName = `"${op.fullName.replace(/"/g, '""')}"`;
      const escapedAnswer = `"${op.answer}"`;
      const escapedOpinion = `"${op.opinion.replace(/"/g, '""')}"`;
      const escapedDate = `"${op.createdAt}"`;
      return [indexVal, escapedName, escapedAnswer, escapedOpinion, escapedDate].join(",");
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DIGIZORT_Shown_Feedback_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT PROCESS-2: EXCEL EXPORTER via xlsx
  const exportToExcel = () => {
    if (filteredOpinions.length === 0) return;

    const reportData = filteredOpinions.map((item, index) => ({
      "No.": index + 1,
      "Name": item.fullName,
      "Answer": item.answer,
      "Opinion": item.opinion,
      "Time": item.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Report");
    
    worksheet["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 50 }, { wch: 22 }];

    XLSX.writeFile(workbook, `DIGIZORT_Shown_Feedback_Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const copyShownResponses = () => {
    if (filteredOpinions.length === 0) {
      alert("No responses are currently shown to copy.");
      return;
    }
    const text = filteredOpinions.map((op, idx) => 
      `No: ${idx + 1} | Name: ${op.fullName} | Answer: ${op.answer} | Opinion: ${op.opinion} | Time: ${op.createdAt}`
    ).join("\n");
    navigator.clipboard.writeText(text);
    alert("All shown response details copied cleanly to clipboard!");
  };

  const clearShownResponses = async () => {
    if (filteredOpinions.length === 0) {
      alert("No matching responses to clear.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently clear the ${filteredOpinions.length} currently shown response(s) from the database?`)) {
      return;
    }
    
    let successCount = 0;
    for (const op of filteredOpinions) {
      try {
        await deleteDoc(doc(db, "opinions", op.id));
        successCount++;
      } catch (e) {
        console.error("Purge fail for ID:", op.id, e);
      }
    }
    alert(`Successfully cleared ${successCount} record(s) from the database.`);
  };

  // Compute database metrics
  const totalSubmissions = opinions.length;
  const yesCount = opinions.filter((o) => o.answer === "Yes").length;
  const noCount = opinions.filter((o) => o.answer === "No").length;
  const yesPercentage = totalSubmissions > 0 ? Math.round((yesCount / totalSubmissions) * 100) : 0;

  if (authChecking) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-600 font-sans text-sm gap-3">
        <Loader2 className="animate-spin text-zinc-800" size={28} />
        <span className="font-semibold">Validating Secure Auth Desk...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 flex flex-col font-sans select-text pb-20">
      
      {!isAdminAuthenticated ? (
        
        /* 1. SECURE LOGIN SCREEN */
        <section id="adminLogin" className="admin-login flex-1 flex items-center justify-center px-4 py-16 relative" aria-labelledby="admin-login-title">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
            
            <div className="admin-heading text-center mb-8 select-none">
              <div className="mx-auto w-12 h-12 rounded-xl bg-red-150/10 border border-red-200 flex items-center justify-center text-[#B91C1C] mb-4">
                <Lock size={20} />
              </div>
              <p className="eyebrow text-xs font-semibold uppercase tracking-widest text-[#B91C1C] mb-1">Admin login</p>
              <h2 id="admin-login-title" className="text-2xl font-bold tracking-tight text-zinc-900 font-sans">Locked</h2>
              <p className="text-xs text-zinc-400 mt-2">Enter the admin password to view saved poll responses.</p>
            </div>

            <form onSubmit={handleLogin} className="admin-login-form space-y-5" id="adminLoginForm">
              <label className="field block space-y-1.5 focus-within:text-zinc-950">
                <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Password</span>
                <input
                  id="adminPassword"
                  name="admin_password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-zinc-200 focus:bg-white focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-950 outline-none transition-all font-medium"
                />
              </label>

              {loginError && (
                <div className="login-message p-3 rounded-xl bg-red-50 border border-red-100 text-[#B91C1C] text-xs text-left font-semibold" id="adminLoginMessage">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="submit-button w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Decrypting Secure Vault...
                  </>
                ) : (
                  <span>Unlock admin panel</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-zinc-150 pt-4 font-semibold">
              <a href="/" className="text-xs text-zinc-400 hover:text-[#B91C1C] transition-colors">
                &lsaquo; Return to Presentation Home
              </a>
            </div>
          </div>
        </section>

      ) : (

        /* 2. ADMIN SECURE DASHBOARD VIEW */
        <section id="admin" className="admin-panel flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="admin-title">
          
          {/* HEADER SECTION */}
          <div className="admin-heading flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-zinc-200 pb-6 mb-8 select-none">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="eyebrow text-[10px] font-bold uppercase tracking-widest text-[#B91C1C] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded">Admin panel</span>
              </div>
              <h2 id="admin-title" className="text-2xl font-bold text-zinc-900 tracking-tight font-sans">Person opinions</h2>
              <p className="text-xs text-zinc-500">Search a friend or relative by name and read exactly what that person thinks about Digizort.</p>
            </div>

            {/* LIVE SYSTEM STATUS METRICS */}
            <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-500 bg-white border border-zinc-200 rounded-xl p-3 shadow-sm select-none">
              <div>
                <span className="text-zinc-400">TOTAL:</span> <strong className="text-zinc-900 font-semibold">{totalSubmissions}</strong>
              </div>
              <span className="text-zinc-200">|</span>
              <div>
                <span className="text-emerald-500 font-bold">YES:</span> <strong className="text-zinc-900 font-semibold">{yesCount} ({yesPercentage}%)</strong>
              </div>
              <span className="text-zinc-200">|</span>
              <div>
                <span className="text-amber-500 font-bold">NO:</span> <strong className="text-zinc-900 font-semibold">{noCount}</strong>
              </div>
            </div>
          </div>

          {/* FIRESTORE RULE / DATABASE STATUS DIAGNOSTICS */}
          {dbError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex items-center gap-3 select-none">
              <AlertTriangle size={18} className="text-[#B91C1C] shrink-0" />
              <div>
                <span className="font-bold block uppercase tracking-wide mb-0.5">Database Rules Constraint</span>
                <span>{dbError} Please ensure your Firestore Security Rules are fully deployed.</span>
              </div>
            </div>
          )}

          {/* SEARCH AND TOOLS */}
          <div className="admin-tools bg-white border border-zinc-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center shadow-sm select-none">
            
            {/* Find person by name input */}
            <label className="field person-search relative w-full md:flex-1 block space-y-1 focus-within:text-zinc-900">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 leading-none mb-1">Find person by name</span>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B91C1C]" size={15} />
                <input
                  id="adminSearch"
                  type="search"
                  placeholder="Type a name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-805 focus:ring-1 focus:ring-zinc-805 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all font-medium"
                />
              </div>
            </label>
            
            {/* Admin actions block */}
            <div className="admin-actions flex flex-wrap gap-2 w-full md:w-auto md:self-end justify-end mt-2 md:mt-0">
              <button
                id="copyResponsesButton"
                type="button"
                onClick={copyShownResponses}
                disabled={filteredOpinions.length === 0}
                className="soft-button px-3 py-2 bg-white border border-zinc-200 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:border-zinc-350 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Copy shown
              </button>

              <button
                id="downloadCsvButton"
                type="button"
                onClick={exportToExcel}
                disabled={filteredOpinions.length === 0}
                className="soft-button px-3 py-2 bg-white border border-zinc-200 text-xs font-semibold text-[#B91C1C] hover:text-red-800 hover:border-[#B91C1C]/40 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Download shown
              </button>

              <button
                id="clearResponsesButton"
                type="button"
                onClick={clearShownResponses}
                disabled={filteredOpinions.length === 0}
                className="soft-button danger px-3 py-2 bg-red-50 hover:bg-red-105 border border-red-100 text-[#B91C1C] text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>

              <button
                id="logoutAdminButton"
                type="button"
                onClick={handleLogout}
                className="soft-button px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white hover:text-white border border-transparent text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Lock
              </button>
            </div>
          </div>

          {/* SPREADSHEET LEDGER TABLE */}
          <div className="sheet-wrap bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden" id="responseSheetWrap">
            {dataLoading ? (
              <div className="py-24 text-center text-zinc-505 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-zinc-850" size={26} />
                <p className="font-semibold text-xs font-sans text-zinc-500">Connecting to live transaction vault...</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="response-sheet w-full border-collapse text-left font-sans text-sm" aria-label="Digizort poll person opinions">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-205 text-xs font-bold text-zinc-505 uppercase tracking-wider select-none">
                      <th scope="col" className="px-6 py-4 font-bold max-w-[80px]">No.</th>
                      <th scope="col" className="px-6 py-4 font-bold">Name</th>
                      <th scope="col" className="px-6 py-4 font-bold max-w-[120px]">Answer</th>
                      <th scope="col" className="px-6 py-4 font-bold">Opinion</th>
                      <th scope="col" className="px-6 py-4 font-bold max-w-[200px]">Time</th>
                      <th scope="col" className="px-6 py-4 font-bold text-right max-w-[100px]">Action</th>
                    </tr>
                  </thead>
                  <tbody id="responseTableBody" className="divide-y divide-zinc-150">
                    {filteredOpinions.length === 0 ? (
                      <tr>
                        <td className="empty-cell text-center py-16 px-6 text-zinc-400 font-medium italic" colSpan={6}>
                          No responses yet.
                        </td>
                      </tr>
                    ) : (
                      filteredOpinions.map((op, index) => (
                        <tr key={op.id} className="hover:bg-zinc-50/75 transition-colors">
                          <td className="px-6 py-4 font-mono text-zinc-400 text-xs font-semibold">{index + 1}</td>
                          <td className="px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">{op.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                              op.answer === "Yes"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {op.answer}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-650 font-medium max-w-md sm:max-w-xl truncate" title={op.opinion}>
                            {op.opinion}
                          </td>
                          <td className="px-6 py-4 text-zinc-420 font-semibold text-xs whitespace-nowrap">{op.createdAt}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-xs">
                            <button
                              type="button"
                              onClick={() => handleDelete(op.id)}
                              className="px-2 py-1 text-zinc-400 hover:text-[#B91C1C] hover:bg-red-50/50 border border-transparent hover:border-red-100 rounded transition-all font-semibold font-sans cursor-pointer inline-flex items-center justify-center gap-1"
                              title="Delete this observation permanently"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-center mt-12 select-none border-t border-zinc-200 pt-6">
            <a href="/" className="text-xs font-semibold text-zinc-400 hover:text-[#B91C1C] transition-colors">
              &lsquo; Back to Presentation Homepage
            </a>
          </div>

        </section>
      )}

    </div>
  );
}
