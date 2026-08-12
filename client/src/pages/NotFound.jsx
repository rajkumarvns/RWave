import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-linear-to-b from-primary to-transparent pointer-events-none" />

      <div className="p-12 rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl z-10 glass-panel flex flex-col items-center">
        <h1 className="text-7xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl text-slate-50 mb-2">Lost in the Wave</h2>
        <p className="text-slate-400 text-center mb-8">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="px-6 py-3 bg-primary hover:bg-secondary transition-colors rounded-lg font-semibold text-white shadow-lg shadow-primary/20"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
