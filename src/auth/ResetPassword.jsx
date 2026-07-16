import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reset Password - Intelligent Portal";
  }, []);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess("Your password has been successfully reset! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
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
              Security Update
            </span>

            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Create a
              <br />
              <span className="text-purple-600">new password</span>
              <br />
              for your account.
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
              Make sure your new password is at least 6 characters long, unique, and secure.
            </p>
          </div>

          {/* Right Panel */}
          <div className="w-96 p-10 border-l border-gray-100 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Choose Password
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Enter and confirm your new password.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg border border-red-100 mb-4 animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-lg border border-emerald-100 mb-4 animate-fade-in">
                {success}
              </div>
            )}

            {!token && (
              <div className="bg-amber-50 text-amber-800 text-xs font-semibold p-4 rounded-lg border border-amber-100 mb-4">
                Warning: Missing recovery token. Please request a new reset link.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    required
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors mb-5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Save Password"}
              </button>
            </form>
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

export default ResetPassword;
