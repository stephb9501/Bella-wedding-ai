import { createClient } from "@supabase/supabase-js";

// Use environment variables for better security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cksukpgjkuarktbohseh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrc3VrcGdqa3Vhcmt0Ym9oc2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTQ1MTIsImV4cCI6MjA3ODEzMDUxMn0.UVftxK_90CanKkaFcjylCXRfXMsZQE9Y6toCV-KmjHI";

// Client-side Supabase instance for auth and client operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'bella-wedding-ai-client'
    }
  }
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Helper function to sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
    throw error;
  }

  return data;
};

// Helper function to sign up with email and password
export const signUp = async (email: string, password: string, userData?: Record<string, any>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (error) {
    console.error("Error signing up:", error);
    throw error;
  }

  return data;
};

// Helper function to reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error("Error resetting password:", error);
    throw error;
  }

  return data;
};