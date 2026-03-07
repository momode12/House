import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { showAlert } from "../utils/Alerts";

// ✅ HTTP helpers — plus de fetch() brut dans les pages
import { getJson, post } from "../services/api";

// ✅ Types — séparés du service HTTP
import type {
  Labels, PredictionResult, HistoryItem,
  Stats, FormState, UserProfile,
} from "../types/api";

import Navbar         from "../components/Navbar";
import PredictionForm from "../components/PredictionForm";
import HistoryPanel   from "../components/HistoryPanel";
import MonitoringTab  from "../components/MonitoringTab";
import ProfileModal   from "../components/ProfileModal";

const DEFAULT_FORM: FormState = {
  location: "0", status: "0", transaction: "0",
  furnishing: "0", bathroom: "2", balcony: "1",
  ownership: "0", floor_num: "5",
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<"prediction" | "monitoring">("prediction");
  const [profileOpen, setProfileOpen]   = useState(false);

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>({ username: "Utilisateur", avatar: "indigo" });

  // ── Data state ────────────────────────────────────────────────────────────
  const [labels, setLabels]             = useState<Labels | null>(null);
  const [form, setForm]                 = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<PredictionResult | null>(null);
  const [history, setHistory]           = useState<HistoryItem[]>([]);
  const [stats, setStats]               = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setProfile((p) => ({
          ...p,
          username: user.username || "Utilisateur",
          email: user.email,
          avatar: user.avatar ?? "indigo",
        }));
      } catch (_) {}
    }

    getJson<Labels>("labels")
      .then(setLabels)
      .catch(() => console.warn("Labels non chargés"));
  }, []);

  useEffect(() => {
    if (activeTab === "monitoring") fetchStats();
  }, [activeTab]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getJson<Stats>("stats");
      setStats(data);
    } catch {
      console.warn("Stats non chargées");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showAlert.confirm("Déconnexion", "Êtes-vous sûr de vouloir quitter ?");
    if (confirmed.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await post<PredictionResult>("predict", {
        location:    parseInt(form.location),
        status:      parseInt(form.status),
        transaction: parseInt(form.transaction),
        furnishing:  parseInt(form.furnishing),
        bathroom:    parseFloat(form.bathroom),
        balcony:     parseFloat(form.balcony),
        ownership:   parseInt(form.ownership),
        floor_num:   parseFloat(form.floor_num),
      });
      setResult(data);
      setHistory((prev) => [
        { id: Date.now(), inputs: { ...form }, result: data, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
    } catch {
      showAlert.error("Erreur", "Impossible de contacter l'API. Vérifiez que Flask tourne sur localhost:5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    // Persist avatar choice alongside existing user data
    const stored = localStorage.getItem("user");
    const user   = stored ? JSON.parse(stored) : {};
    localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <Navbar
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onEditProfile={() => setProfileOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "prediction" && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <PredictionForm
                labels={labels}
                form={form}
                loading={loading}
                result={result}
                onChange={handleChange}
                onPredict={handlePredict}
              />
              <HistoryPanel history={history} labels={labels} />
            </motion.div>
          )}

          {activeTab === "monitoring" && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MonitoringTab
                stats={stats}
                statsLoading={statsLoading}
                labels={labels}
                onRefresh={fetchStats}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile modal */}
      <ProfileModal
        isOpen={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Dashboard;