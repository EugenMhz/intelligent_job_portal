import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 JobPortal. Built with React and mock data.</p>
        <p className="font-medium text-slate-700">Career matching made simpler.</p>
      </div>
    </footer>
  );
}
