import React from "react";
import { motion } from "framer-motion";
import type { Labels, FormState, PredictionResult } from "../types/api";
import ResultCard from "./ResultCard";

interface PredictionFormProps {
  labels: Labels | null;
  form: FormState;
  loading: boolean;
  result: PredictionResult | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onPredict: () => void;
}

const selectClass =
  "w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent";
const inputClass =
  "w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

type SelectField = {
  name: keyof FormState;
  label: string;
  optionsKey: keyof Labels;
};

type NumberField = {
  name: keyof FormState;
  label: string;
  min: number;
  max: number;
};

const SELECT_FIELDS: SelectField[] = [
  { name: "location",    label: "Ville / Location",      optionsKey: "location"    },
  { name: "status",      label: "Status",                optionsKey: "Status"      },
  { name: "transaction", label: "Type de Transaction",   optionsKey: "Transaction" },
  { name: "furnishing",  label: "Ameublement",           optionsKey: "Furnishing"  },
  { name: "ownership",   label: "Type de Propriété",     optionsKey: "Ownership"   },
];

const NUMBER_FIELDS: NumberField[] = [
  { name: "bathroom",  label: "Salles de Bain", min: 1, max: 10 },
  { name: "balcony",   label: "Balcons",        min: 0, max: 5  },
  { name: "floor_num", label: "Étage",          min: 0, max: 50 },
];

const PredictionForm: React.FC<PredictionFormProps> = ({
  labels,
  form,
  loading,
  result,
  onChange,
  onPredict,
}) => (
  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
    <div className="mb-5">
      <h2 className="text-xl font-bold text-gray-900">Prédiction de Prix 🏠</h2>
      <p className="text-xs text-gray-500 mt-1">
        Remplissez les caractéristiques pour estimer le prix
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Select fields */}
      {SELECT_FIELDS.map(({ name, label, optionsKey }) => (
        <div key={name}>
          <label className={labelClass}>{label}</label>
          <select
            name={name}
            value={form[name]}
            onChange={onChange}
            className={selectClass}
          >
            {labels?.[optionsKey] ? (
              Object.entries(labels[optionsKey]).map(([val, lbl]) => (
                <option key={val} value={val}>
                  {lbl}
                </option>
              ))
            ) : (
              <option>Chargement...</option>
            )}
          </select>
        </div>
      ))}

      {/* Number fields */}
      {NUMBER_FIELDS.map(({ name, label, min, max }) => (
        <div key={name}>
          <label className={labelClass}>{label}</label>
          <input
            type="number"
            name={name}
            min={min}
            max={max}
            value={form[name]}
            onChange={onChange}
            className={inputClass}
          />
        </div>
      ))}
    </div>

    {/* Submit */}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPredict}
      disabled={loading}
      className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white
        font-semibold py-3 rounded-xl hover:shadow-lg transition-shadow
        disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Calcul en cours...
        </span>
      ) : (
        "🔮 Prédire le Prix"
      )}
    </motion.button>

    <ResultCard result={result} />
  </div>
);

export default PredictionForm;