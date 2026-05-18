import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify & reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSimulatedOtp("");

    const sanitizedEmail = email
      .replace(/[<>'"&;]/g, "")
      .trim()
      .toLowerCase();
    if (!sanitizedEmail) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(sanitizedEmail);
    setIsLoading(false);

    if (result.ok) {
      setSuccess("A secure 6-digit OTP code has been generated!");
      if (result.data?.otp) {
        setSimulatedOtp(result.data.otp);
      }
      setStep(2);
    } else {
      setError(
        result.message ||
          "Failed to send OTP. Make sure the email is registered.",
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedOtp = otp.trim();

    if (!sanitizedOtp) {
      setError("OTP is required");
      return;
    }
    if (!/^\d{6}$/.test(sanitizedOtp)) {
      setError("OTP must be a 6-digit number");
      return;
    }
    if (!newPassword) {
      setError("New password is required");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(
      sanitizedEmail,
      sanitizedOtp,
      newPassword,
    );
    setIsLoading(false);

    if (result.ok) {
      setSuccess(
        "Your password has been successfully reset! You can now log in instantly.",
      );
      setStep(3); // Success step
    } else {
      setError(
        result.message ||
          "Verification failed. The OTP is invalid or has expired.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link
            to="/"
            className="text-4xl font-bold text-green-600 dark:text-green-400"
          >
            CareerX-AI
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {step === 1
              ? "Forgot Password"
              : step === 2
                ? "Verify OTP & Reset"
                : "Success!"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {step === 1
              ? "Request a secure OTP code to recover your account"
              : step === 2
                ? "Enter the 6-digit OTP code and choose a new password"
                : "Your security has been updated successfully"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send OTP Code"}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP & Reset Password */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {/* Simulated OTP Banner */}
              {simulatedOtp && (
                <div className="p-4 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/30">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                    Local test OTP code:
                  </p>
                  <code className="block select-all text-center bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-md text-lg font-bold font-mono text-gray-800 dark:text-gray-200 tracking-widest border border-gray-200 dark:border-gray-800">
                    {simulatedOtp}
                  </code>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Email
                </label>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-md border border-gray-100 dark:border-gray-800">
                  {email}
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  6-Digit OTP Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    pattern="\d{6}"
                    maxLength="6"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 text-center tracking-widest text-lg font-bold"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-hidden"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/30">
                <p className="text-sm font-semibold text-green-800 dark:text-green-400 text-center">
                  {success}
                </p>
              </div>
              <div>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-750 pt-4">
              <Link
                to="/login"
                className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400"
              >
                &larr; Back to sign in
              </Link>
              <Link
                to="/signup"
                className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400"
              >
                Join CareerX-AI
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
