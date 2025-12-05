import React, { useState, useCallback } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginComponent = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    totpCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Add this hook
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API base URL - Fixed to match your backend port
  const API_BASE_URL = "http://localhost:5000";

  // API call wrapper
  const apiCall = useCallback(
    async (endpoint, options = {}) => {
      try {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        };

        console.log(`Making API call to: ${url}`);
        const response = await fetch(url, config);
        return response;
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    [API_BASE_URL]
  );

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  }, []);

  // Update the defaultOnLogin function to use navigate
  const defaultOnLogin = useCallback(
    (loginData) => {
      console.log("✅ Login successful! User data:", loginData.user);
      // Redirect to dashboard instead of refreshing
      navigate("/dashboard");
    },
    [navigate]
  );

  // Safe onLogin call with fallback
  const safeOnLogin = useCallback(
    (loginData) => {
      if (typeof onLogin === "function") {
        onLogin(loginData);
      } else {
        defaultOnLogin(loginData);
      }
    },
    [onLogin, defaultOnLogin]
  );

  const handleLogin = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validation
      if (!formData.username || !formData.password) {
        setError("Username and password are required");
        return;
      }

      if (requireTwoFactor && !formData.totpCode) {
        setError("Two-factor authentication code is required");
        return;
      }

      console.log("Attempting login for:", formData.username);

      // Call login API
      const response = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          totpCode: formData.totpCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requireTwoFactor) {
          // 2FA required
          console.log("2FA required for user");
          setRequireTwoFactor(true);
          setSuccess("Please enter your two-factor authentication code");
          return;
        }

        // Login successful
        console.log("Login successful:", data.user.username);
        console.log("User has components:", data.user.components?.length || 0);
        console.log("User role:", data.user.roleDisplayName);
        setSuccess("Login successful! Redirecting...");

        // Store authentication data
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Pass user data to parent component with safe call
        setTimeout(() => {
          safeOnLogin({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        }, 1000);
      } else {
        console.log("Login failed:", data.message);
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, requireTwoFactor, apiCall, safeOnLogin]);

  const resetForm = useCallback(() => {
    setFormData({ username: "", password: "", totpCode: "" });
    setRequireTwoFactor(false);
    setError("");
    setSuccess("");
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    },
    [handleLogin]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-blue-100">
            {requireTwoFactor ? "Enter 2FA Code" : "Sign in to your account"}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <div className="space-y-6">
            {!requireTwoFactor ? (
              <>
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter your username or email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 2FA Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Two-Factor Authentication Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.totpCode}
                      onChange={(e) =>
                        handleInputChange("totpCode", e.target.value)
                      }
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Back to login */}
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to login
                </button>
              </>
            )}

            {/* Submit Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader className="animate-spin w-5 h-5" />
                  {requireTwoFactor ? "Verifying..." : "Signing in..."}
                </div>
              ) : requireTwoFactor ? (
                "Verify Code"
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Secure authentication powered by JWT & 2FA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add default props for better error handling
LoginComponent.defaultProps = {
  onLogin: undefined,
};

export default LoginComponent;
