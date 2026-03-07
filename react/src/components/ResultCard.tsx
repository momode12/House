import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PredictionResult } from "../types/api";

interface ResultCardProps {
  result: PredictionResult | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const ResultCard: React.FC<ResultCardProps> = ({ result }) => (
  <AnimatePresence>
    {result && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mt-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white"
      >
        <p className="text-xs font-medium text-indigo-200 mb-1">Prix estimé</p>
        <p className="text-3xl font-bold mb-3">
          {formatPrice(result.predicted_price)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo-200">En Lac</p>
            <p className="text-xl font-bold">{result.price_in_lac} L</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo-200">En Crore</p>
            <p className="text-xl font-bold">{result.price_in_crore} Cr</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ResultCard;