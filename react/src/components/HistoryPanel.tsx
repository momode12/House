import React from "react";
import { motion } from "framer-motion";
import type { HistoryItem, Labels } from "../types/api";

interface HistoryPanelProps {
  history: HistoryItem[];
  labels: Labels | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, labels }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 h-fit"
  >
    <h3 className="text-base font-bold text-gray-900 mb-4">📜 Historique</h3>

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
              <span className="text-[10px] text-gray-400">{item.timestamp}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              {labels?.location?.[item.inputs.location] ?? `Loc. ${item.inputs.location}`}
              {" "}• Bain: {item.inputs.bathroom} • Ét: {item.inputs.floor_num}
            </p>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

export default HistoryPanel;