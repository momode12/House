import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alerts";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000";

interface Labels {
  location: Record<string, string>;
  Status: Record<string, string>;
  Transaction: Record<string, string>;
  Furnishing: Record<string, string>;
  Ownership: Record<string, string>;
}

interface PredictionResult {
  predicted_price: number;
  price_in_lac: number;
  price_in_crore: number;
}

interface HistoryItem {
  id: number;
  inputs: Record<string, string>;
  result: PredictionResult;
  timestamp: string;
}

interface StatsItem {
  price: number;
  price_in_lac: number;
  location: string;
  bathroom: string;
  timestamp: number;
}

interface Stats {
  total_predictions: number;
  avg_price: number;
  avg_price_in_lac: number;
  avg_response_time: number;
  last_predictions: StatsItem[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"prediction" | "monitoring">(
    "prediction",
  );
  const [userName, setUserName] = useState("");
  const [labels, setLabels] = useState<Labels | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [form, setForm] = useState({
    location: "0",
    status: "0",
    transaction: "0",
    furnishing: "0",
    bathroom: "2",
    balcony: "1",
    ownership: "0",
    floor_num: "5",
  });

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setUserName(user.username || "Utilisateur");
      } catch (_e) {}
    }

    fetch(`${API_URL}/labels`)
      .then((res) => res.json())
      .then((data) => setLabels(data))
      .catch(() => console.warn("Labels non chargés"));
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      console.warn("Stats non chargées");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "monitoring") fetchStats();
  }, [activeTab]);

  const handleLogout = async () => {
    const confirmed = await showAlert.confirm(
      "Déconnexion",
      "Êtes-vous sûr de vouloir quitter ?",
    );
    if (confirmed.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: parseInt(form.location),
          status: parseInt(form.status),
          transaction: parseInt(form.transaction),
          furnishing: parseInt(form.furnishing),
          bathroom: parseFloat(form.bathroom),
          balcony: parseFloat(form.balcony),
          ownership: parseInt(form.ownership),
          floor_num: parseFloat(form.floor_num),
        }),
      });
      const data: PredictionResult = await response.json();
      setResult(data);
      setHistory((prev) => [
        {
          id: Date.now(),
          inputs: { ...form },
          result: data,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);
    } catch {
      showAlert.error(
        "Erreur",
        "Impossible de contacter l'API. Vérifiez que Flask tourne sur localhost:5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const selectClass =
    "w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent";
  const inputClass =
    "w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-indigo-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                House Price AI
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-indigo-50 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveTab("prediction")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "prediction"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
              >
                🏠 Prédiction
              </button>
              <button
                onClick={() => setActiveTab("monitoring")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "monitoring"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
              >
                📊 Monitoring
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {/* TAB PRÉDICTION */}
          {activeTab === "prediction" && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* FORMULAIRE */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    Prédiction de Prix 🏠
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Remplissez les caractéristiques pour estimer le prix
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ville / Location</label>
                    <select
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {labels?.location ? (
                        Object.entries(labels.location).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))
                      ) : (
                        <option>Chargement...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {labels?.Status ? (
                        Object.entries(labels.Status).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))
                      ) : (
                        <option>Chargement...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Type de Transaction</label>
                    <select
                      name="transaction"
                      value={form.transaction}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {labels?.Transaction ? (
                        Object.entries(labels.Transaction).map(
                          ([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ),
                        )
                      ) : (
                        <option>Chargement...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ameublement</label>
                    <select
                      name="furnishing"
                      value={form.furnishing}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {labels?.Furnishing ? (
                        Object.entries(labels.Furnishing).map(
                          ([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ),
                        )
                      ) : (
                        <option>Chargement...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Type de Propriété</label>
                    <select
                      name="ownership"
                      value={form.ownership}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {labels?.Ownership ? (
                        Object.entries(labels.Ownership).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))
                      ) : (
                        <option>Chargement...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Salles de Bain</label>
                    <input
                      type="number"
                      name="bathroom"
                      min="1"
                      max="10"
                      value={form.bathroom}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Balcons</label>
                    <input
                      type="number"
                      name="balcony"
                      min="0"
                      max="5"
                      value={form.balcony}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Étage</label>
                    <input
                      type="number"
                      name="floor_num"
                      min="0"
                      max="50"
                      value={form.floor_num}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePredict}
                  disabled={loading}
                  className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Calcul en cours...
                    </span>
                  ) : (
                    "🔮 Prédire le Prix"
                  )}
                </motion.button>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white"
                    >
                      <p className="text-xs font-medium text-indigo-200 mb-1">
                        Prix estimé
                      </p>
                      <p className="text-3xl font-bold mb-3">
                        {formatPrice(result.predicted_price)}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-indigo-200">En Lac</p>
                          <p className="text-xl font-bold">
                            {result.price_in_lac} L
                          </p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-indigo-200">En Crore</p>
                          <p className="text-xl font-bold">
                            {result.price_in_crore} Cr
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* HISTORIQUE */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 h-fit"
              >
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  📜 Historique
                </h3>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">🏘️</p>
                    <p className="text-xs">Aucune prédiction encore</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-indigo-700">
                            {item.result.price_in_lac} Lac
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {labels?.location?.[item.inputs.location] ??
                            `Loc. ${item.inputs.location}`}{" "}
                          • Bain: {item.inputs.bathroom} • Ét:{" "}
                          {item.inputs.floor_num}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* TAB MONITORING */}
          {activeTab === "monitoring" && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Monitoring MLflow 📊
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Suivi en temps réel des prédictions
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {statsLoading ? (
                    <svg
                      className="animate-spin w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    "🔄"
                  )}{" "}
                  Actualiser
                </motion.button>
              </div>

              {statsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <svg
                    className="animate-spin w-8 h-8 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      {
                        label: "Total Prédictions",
                        value: stats.total_predictions,
                        icon: "🔮",
                        color: "from-indigo-500 to-purple-600",
                      },
                      {
                        label: "Prix Moyen",
                        value: `${stats.avg_price_in_lac} Lac`,
                        icon: "💰",
                        color: "from-green-500 to-emerald-600",
                      },
                      {
                        label: "Temps Moyen",
                        value: `${stats.avg_response_time}s`,
                        icon: "⚡",
                        color: "from-orange-500 to-amber-600",
                      },
                      {
                        label: "Statut API",
                        value: "En ligne",
                        icon: "✅",
                        color: "from-blue-500 to-cyan-600",
                      },
                    ].map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500 font-medium">
                            {card.label}
                          </p>
                          <span className="text-xl">{card.icon}</span>
                        </div>
                        <p
                          className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
                        >
                          {card.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">
                      🕐 Dernières Prédictions
                    </h3>
                    {stats.last_predictions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="text-xs">
                          Aucune prédiction encore loggée
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                                Prix (Lac)
                              </th>
                              <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                                Location
                              </th>
                              <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                                Salle de bain
                              </th>
                              <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                                Timestamp
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.last_predictions.map((pred, i) => (
                              <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="border-b border-gray-50 hover:bg-indigo-50 transition-colors"
                              >
                                <td className="py-3">
                                  <span className="font-bold text-indigo-600">
                                    {pred.price_in_lac} L
                                  </span>
                                </td>
                                <td className="py-3 text-gray-600">
                                  {labels?.location?.[pred.location] ??
                                    `Loc. ${pred.location}`}
                                </td>
                                <td className="py-3 text-gray-600">
                                  {pred.bathroom}
                                </td>
                                <td className="py-3 text-gray-400 text-xs">
                                  {new Date(pred.timestamp).toLocaleString()}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-4xl mb-3">📡</p>
                  <p className="text-sm">Impossible de charger les stats</p>
                  <p className="text-xs mt-1">
                    Vérifiez que Flask tourne sur localhost:5000
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
