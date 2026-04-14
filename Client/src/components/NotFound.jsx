import React from "react";
import { Construction, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundWIP = ({
  title = "Page Not Found",
  subtitle = "This page is either under construction or doesn’t exist.",
  show404 = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="max-w-xl w-full text-center bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
        
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-yellow-100 rounded-full animate-pulse">
            <Construction className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* 404 Text */}
        {show404 && (
          <h1 className="text-6xl font-bold text-gray-800 mb-2 tracking-tight">
            404
          </h1>
        )}

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 mb-8">
          {subtitle}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all shadow"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-gray-400">
          🚧 Work in progress — check back soon
        </p>
      </div>
    </div>
  );
};

export default NotFoundWIP;