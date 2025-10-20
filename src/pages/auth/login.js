import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Meta from "@/components/Meta/index";
import { AuthLayout } from "@/layouts/index";
import { isCognito } from "@/lib/auth/config";
import { signInWithCognito } from "@/lib/auth/cognito";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const useCognitoAuth = isCognito();

      if (useCognitoAuth) {
        // Use Cognito for production
        const result = await signInWithCognito(formData.email, formData.password);

        if (result.success) {
          // Sync Cognito user to local database
          try {
            const syncResponse = await fetch('/api/auth/cognito-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: formData.email,
                name: result.user?.username,
                cognitoUserId: result.user?.id,
              }),
            });

            const syncData = await syncResponse.json();

            if (syncData.success) {
              toast.success("Login successful");

              // Store Cognito session tokens in localStorage for API calls
              if (result.session) {
                localStorage.setItem('cognito_access_token', result.session.accessToken);
                localStorage.setItem('cognito_id_token', result.session.idToken);
              }

              // ✅ IMPORTANT: Cache user role for Cognito hook
              const userRole = syncData.user?.role?.toUpperCase();
              localStorage.setItem('user_role', userRole || 'USER');
              localStorage.setItem('user_email', syncData.user?.email);
              localStorage.setItem('user_name', syncData.user?.name);

              // Redirect based on role from database
              if (userRole === 'SUPER_ADMIN') {
                window.location.href = "/admin/secret";
              } else if (userRole === 'ADMIN') {
                window.location.href = "/admin";
              } else {
                window.location.href = "/account";
              }
            } else {
              toast.error("Failed to sync user data");
            }
          } catch (syncError) {
            console.error('Sync error:', syncError);
            toast.success("Login successful");
            router.replace("/account");
          }
        } else {
          // Handle retry case (when session was cleared)
          if (result.shouldRetry) {
            toast.error(result.error + " Redirecting...");
            // Wait a bit then reload the page
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            toast.error(result.error || "Login failed. Please try again.");
          }
        }
      } else {
        // Use NextAuth for local development
        const { signIn: nextAuthSignIn, getSession } = await import("next-auth/react");

        const result = await nextAuthSignIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          if (result.error === "CredentialsSignin") {
            toast.error("Invalid email or password");
          } else {
            toast.error(result.error || "Login failed. Please try again.");
          }
        } else {
          toast.success("Login successful");
          const session = await getSession();
          if (session?.user?.role === "SUPER_ADMIN") {
            router.replace("/admin/secret");
          } else if (session?.user?.role === "ADMIN") {
            router.replace("/admin");
          } else {
            router.replace("/account");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const useCognitoAuth = isCognito();

    if (useCognitoAuth) {
      // Cognito with Google is not configured in this setup
      toast.error("Google login is not available in production. Please use email/password.");
      return;
    }

    // Use NextAuth Google provider for local dev
    try {
      const { signIn: nextAuthSignIn } = await import("next-auth/react");
      await nextAuthSignIn("google", { callbackUrl: "/account" });
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  return (
    <AuthLayout>
      <Meta
        title="LembarKerja | Login"
        description="Sign in to your LembarKerja account"
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              LembarKerja
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          {/* Google Sign In */}
          <div>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 pr-10 border ${errors.password ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

// Disable static generation for auth pages (need client-side only)
export async function getServerSideProps() {
  return { props: {} };
}

export default Login;