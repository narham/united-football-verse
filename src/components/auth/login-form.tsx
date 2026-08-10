/**
 * Login Form Component
 * 
 * Provides sign in and sign up forms with email and password.
 * Handles authentication and displays error messages.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";
import { AlertCircle } from "lucide-react";

type AuthMode = "signin" | "signup";

export function LoginForm() {
  const navigate = useNavigate();
  const { signIn, signUp, authError, clearError } = useAuth();

  // State
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle sign in
  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);
      clearError();

      if (!email || !password) {
        setLocalError("Email and password are required");
        return;
      }

      try {
        setIsLoading(true);
        await signIn(email, password);
        
        // Redirect to home on successful sign in
        navigate({ to: "/" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Sign in failed";
        setLocalError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, signIn, navigate, clearError]
  );

  // Handle sign up
  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);
      clearError();

      if (!email || !displayName || !password) {
        setLocalError("All fields are required");
        return;
      }

      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }

      try {
        setIsLoading(true);
        await signUp(email, displayName, password);
        
        // Redirect to home on successful sign up
        navigate({ to: "/" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Sign up failed";
        setLocalError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, displayName, password, signUp, navigate, clearError]
  );

  const error = localError || authError?.message;
  const isSignIn = mode === "signin";

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>{isSignIn ? "Welcome Back" : "Create Account"}</CardTitle>
        <CardDescription>
          {isSignIn ? "Sign in to your account to continue" : "Create a new account to get started"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
          {/* Display Name (Sign Up Only) */}
          {!isSignIn && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            {!isSignIn && (
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                {isSignIn ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              isSignIn ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-4 text-center text-sm">
          {isSignIn ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setLocalError(null);
                  clearError();
                  setEmail("");
                  setPassword("");
                  setDisplayName("");
                }}
                className="font-medium text-primary hover:underline"
                disabled={isLoading}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setLocalError(null);
                  clearError();
                  setEmail("");
                  setPassword("");
                  setDisplayName("");
                }}
                className="font-medium text-primary hover:underline"
                disabled={isLoading}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Demo Credentials */}
        {isSignIn && (
          <div className="mt-6 rounded-lg bg-blue-50 p-3 text-xs text-gray-700 dark:bg-blue-950 dark:text-blue-200">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Email: <code className="font-mono">demo@bolaid.id</code></p>
            <p>Password: <code className="font-mono">demo123</code></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
