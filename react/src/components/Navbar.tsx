import React, { useState } from "react";
import { motion } from "framer-motion";
import type { UserProfile } from "../types/api";
import { AVATAR_COLORS } from "./ProfileModal";

interface NavbarProps {
  profile: UserProfile;
  activeTab: "prediction" | "monitoring";
  onTabChange: (tab: "prediction" | "monitoring") => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onTabChange,
  onLogout,
  onEditProfile,
}) => {
  const [hovered, setHovered] = useState(false);

  const avatarColor =
    AVATAR_COLORS.find((c) => c.key === profile.avatar) ?? AVATAR_COLORS[0];

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-indigo-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">

          {/* Logo */}
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
            {(["prediction", "monitoring"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
              >
                {tab === "prediction" ? "🏠 Prédiction" : "📊 Monitoring"}
              </button>
            ))}
          </div>

          {/* Profile + Logout */}
          <div className="flex items-center space-x-3">

            {/* Animated profile chip */}
            <motion.button
              onClick={onEditProfile}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r
                from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 cursor-pointer
                hover:border-indigo-400 transition-colors relative overflow-hidden"
            >
              {/* Avatar */}
              <motion.div
                key={profile.avatar}
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-6 h-6 bg-gradient-to-br ${avatarColor.bg} rounded-full
                  flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
              >
                {profile.username.charAt(0).toUpperCase()}
              </motion.div>

              <span className="text-xs font-semibold text-gray-800">
                {profile.username}
              </span>

              {/* Edit hint */}
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: hovered ? 1 : 0, width: hovered ? "auto" : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] text-indigo-400 font-medium overflow-hidden whitespace-nowrap"
              >
                ✏️ éditer
              </motion.span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Déconnexion
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;