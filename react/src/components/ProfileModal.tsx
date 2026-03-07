import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "../types/api";

const AVATAR_COLORS = [
  { key: "indigo",  bg: "from-indigo-500 to-purple-600",  label: "Indigo"  },
  { key: "rose",    bg: "from-rose-500 to-pink-600",      label: "Rose"    },
  { key: "emerald", bg: "from-emerald-500 to-teal-600",   label: "Vert"    },
  { key: "amber",   bg: "from-amber-500 to-orange-600",   label: "Ambre"   },
  { key: "sky",     bg: "from-sky-500 to-blue-600",       label: "Bleu"    },
];

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<UserProfile>(profile);

  const currentColor =
    AVATAR_COLORS.find((c) => c.key === draft.avatar) ?? AVATAR_COLORS[0];

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  ✏️ Mon Profil
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Avatar preview */}
              <div className="flex justify-center mb-6">
                <motion.div
                  key={draft.avatar}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentColor.bg} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white text-3xl font-bold">
                    {draft.username.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              </div>

              {/* Color picker */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Couleur de l'avatar
                </p>
                <div className="flex gap-3 justify-center">
                  {AVATAR_COLORS.map((color) => (
                    <motion.button
                      key={color.key}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setDraft((d) => ({ ...d, avatar: color.key }))
                      }
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.bg} transition-all
                        ${draft.avatar === color.key
                          ? "ring-2 ring-offset-2 ring-indigo-400 scale-110"
                          : "opacity-70"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Username */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={draft.username}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, username: e.target.value }))
                  }
                  className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              {/* Email (optional) */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, email: e.target.value }))
                  }
                  placeholder="exemple@mail.com"
                  className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold
                    text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                    text-white text-sm font-semibold hover:shadow-md transition"
                >
                  Sauvegarder
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { AVATAR_COLORS };
export default ProfileModal;