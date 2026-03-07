import React from "react";
import { motion } from "framer-motion";
import type { Stats, Labels } from "../types/api";

interface MonitoringTabProps {
  stats: Stats | null;
  statsLoading: boolean;
  labels: Labels | null;
  onRefresh: () => void;
}

const Spinner = ({ size = "w-8 h-8" }: { size?: string }) => (
  <svg className={`animate-spin ${size} text-indigo-600`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const MonitoringTab: React.FC<MonitoringTabProps> = ({
  stats, statsLoading, labels, onRefresh,
}) => {
  const statCards = stats
    ? [
        { label: "Total Prédictions", value: stats.total_predictions,        icon: "🔮", color: "from-indigo-500 to-purple-600"  },
        { label: "Prix Moyen",        value: `${stats.avg_price_in_lac} Lac`, icon: "💰", color: "from-green-500 to-emerald-600"  },
        { label: "Temps Moyen",       value: `${stats.avg_response_time}s`,   icon: "⚡", color: "from-orange-500 to-amber-600"   },
        { label: "Statut API",        value: "En ligne",                      icon: "✅", color: "from-blue-500 to-cyan-600"      },
      ]
    : [];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monitoring MLflow 📊</h2>
          <p className="text-xs text-gray-500 mt-1">Suivi en temps réel des prédictions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          disabled={statsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs
            font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {statsLoading ? <Spinner size="w-3 h-3" /> : "🔄"} Actualiser
        </motion.button>
      </div>

      {/* States */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <p className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  {card.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">🕐 Dernières Prédictions</h3>
            {stats.last_predictions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-xs">Aucune prédiction encore loggée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Prix (Lac)", "Location", "Salle de bain", "Timestamp"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3">{h}</th>
                      ))}
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
                          <span className="font-bold text-indigo-600">{pred.price_in_lac} L</span>
                        </td>
                        <td className="py-3 text-gray-600">
                          {labels?.location?.[pred.location] ?? `Loc. ${pred.location}`}
                        </td>
                        <td className="py-3 text-gray-600">{pred.bathroom}</td>
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
          <p className="text-xs mt-1">Vérifiez que Flask tourne sur localhost:5000</p>
        </div>
      )}
    </>
  );
};

export default MonitoringTab;