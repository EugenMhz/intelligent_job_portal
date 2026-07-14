import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  useEffect(() => {
    document.title = "Forgot Password - Intelligent Portal";
  }, []);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devResetLink, setDevResetLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevResetLink("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSuccess("If the email is registered, a password reset link will be sent.");
      if (data.dev_reset_link) {
        setDevResetLink(data.dev_reset_link);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF0F8] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
              <path
                d="M8 12C8 9.79 9.79 8 12 8s4 1.79 4 4-1.79 4-4 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="2" fill="white" />
              <path
                d="M12 6V4M12 20v-2M18 12h2M4 12h2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <Link to="/" className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors">
            Intelligent Job Portal
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl flex max-w-4xl w-full overflow-hidden shadow-md">
          {/* Left Panel */}
          <div className="flex-1 p-10 relative overflow-hidden flex flex-col justify-center bg-gray-50">
            <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full tracking-widest uppercase mb-5 w-fit">
              Security Control
            </span>

            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Recover your
              <br />
              <span className="text-purple-600">credentials</span>
              <br />
              securely.
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
              Enter your email address and we'll help you get back to managing your job searches and recruitment processes.
            </p>
          </div>

          {/* Right Panel */}
          <div className="w-96 p-10 border-l border-gray-100 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Reset Password
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Enter your email to request a reset link.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg border border-red-100 mb-4 animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-lg border border-emerald-100 mb-4 animate-fade-in space-y-2">
                <div>{success}</div>
                {devResetLink && (
                  <div className="mt-2 bg-slate-900 text-slate-100 p-2.5 rounded border border-slate-700 text-center font-mono text-[10px] break-all select-all">
                    <p className="text-slate-400 mb-1 text-left font-bold uppercase text-[9px]">Local Dev Mode Reset Link:</p>
                    <a href={devResetLink} className="underline text-violet-400 hover:text-violet-300 font-semibold">
                      Click here to reset password
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors mb-5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Send Reset Link"}
              </button>
            </form>

            {/* Return Link */}
            <p className="text-center text-sm text-gray-400">
              Remembered password?{" "}
              <Link
                to="/"
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4">
        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 mx-3">
          Privacy Policy
        </a>
        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 mx-3">
          Terms of Service
        </a>
        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 mx-3">
          Contact Support
        </a>
      </footer>
    </div>
  );
};

export default ForgotPassword;
