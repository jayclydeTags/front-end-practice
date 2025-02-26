"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Default credentials
export const DEFAULT_EMAIL = "admin@example.com";
export const DEFAULT_PASSWORD = "password123";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);  // Ensure this is set correctly
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (typeof window !== "undefined") {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);
  

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      const userData = { email };
      setUser(userData);
      setIsAuthenticated(true);
  
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Error setting localStorage:", error);
        }
      }
  
      // Redirect to dashboard after login
      router.push("/dashboard");
  
      return true;
    }
    return false;
  };
  

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Only remove from localStorage on client side
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    }
    
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
