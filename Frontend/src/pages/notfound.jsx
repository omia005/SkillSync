import { useState, useEffect } from "react";
import api from "../api";
import { CheckCircle2, AlertCircle, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const NotFound = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    const redirect = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-red-100 rounded-full blur-xl opacity-50"></div>
            <AlertCircle className="w-32 h-32 text-red-500 mx-auto relative" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Don't
          worry, we'll get you back on track.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all duration-200"
          >
            ← Back to Dashboard
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            Go Home
          </a>
        </div>
        <p className="mt-8 text-sm text-gray-400">
          Redirecting in{" "}
          <span className="font-semibold text-indigo-600">{countdown}</span>{" "}
          seconds...
        </p>
      </div>
    </div>
  );
};

export default NotFound;