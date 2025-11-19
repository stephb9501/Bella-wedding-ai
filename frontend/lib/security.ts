// Security Utilities
// XSS sanitization, input validation, password strength, JWT validation

import { createClient } from '@supabase/supabase-js';

/**
 * XSS Sanitization
 * Remove potentially dangerous HTML/JavaScript from user input
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'style', 'meta'];
  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    sanitized = sanitized.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
  });

  return sanitized.trim();
}

/**
 * Sanitize text input (escape HTML entities)
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * SQL Injection Prevention
 * Validate and sanitize inputs before using in SQL queries
 * Note: Always use parameterized queries - this is just an extra layer
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';

  // Remove SQL comments
  let sanitized = input.replace(/--.*$/gm, '');
  sanitized = sanitized.replace(/\/\*.*?\*\//g, '');

  // Remove dangerous SQL keywords (when used suspiciously)
  const dangerousPatterns = [
    /;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\s+/gi,
    /UNION\s+SELECT/gi,
    /'\s*OR\s*'1'\s*=\s*'1/gi,
    /'\s*OR\s*1\s*=\s*1/gi,
  ];

  dangerousPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
}

/**
 * Input Validation Helpers
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  password: (password: string): boolean => {
    // Minimum 8 characters
    return password.length >= 8 && password.length <= 128;
  },

  username: (username: string): boolean => {
    // 3-30 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  },

  phone: (phone: string): boolean => {
    // Basic phone validation (10-15 digits, optional + prefix)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  url: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  alphanumeric: (input: string): boolean => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(input);
  },

  numeric: (input: string): boolean => {
    return /^\d+$/.test(input);
  },

  date: (date: string): boolean => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  },
};

/**
 * Password Strength Checker
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ['Password is required'], isStrong: false };
  }

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one special character');
  }

  // Common password check
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
  ];

  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common passwords');
  }

  // Normalize score to 0-4
  score = Math.min(4, score);

  const isStrong = score >= 3;

  if (isStrong && feedback.length === 0) {
    feedback.push('Strong password');
  }

  return { score, feedback, isStrong };
}

/**
 * JWT Token Validation
 */
export function validateJwtFormat(token: string): boolean {
  if (!token) return false;

  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Each part should be base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every((part) => base64UrlRegex.test(part));
}

/**
 * Verify JWT token with Supabase
 */
export async function verifyJwtToken(token: string): Promise<boolean> {
  try {
    if (!validateJwtFormat(token)) return false;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.getUser(token);

    return !error && !!data.user;
  } catch {
    return false;
  }
}

/**
 * Rate Limiting Helper (in-memory for middleware)
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (record.count >= this.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    this.requests.set(identifier, record);
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * CSRF Token Generation and Validation
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Data Encryption Helpers (for sensitive data)
 */
export async function hashData(data: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: Use Node.js crypto
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  } else {
    // Client-side: Use Web Crypto API
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Validate Content-Type to prevent MIME confusion attacks
 */
export function validateContentType(
  contentType: string | null,
  expected: string[]
): boolean {
  if (!contentType) return false;
  const type = contentType.split(';')[0].trim().toLowerCase();
  return expected.includes(type);
}

/**
 * Remove sensitive data before logging
 */
export function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'csrf',
    'ssn',
    'credit_card',
    'cvv',
  ];

  const sanitized = { ...data };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Input length validation
 */
export function validateLength(
  input: string,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (input.length < min) {
    return { valid: false, error: `Input must be at least ${min} characters` };
  }
  if (input.length > max) {
    return { valid: false, error: `Input must be no more than ${max} characters` };
  }
  return { valid: true };
}

/**
 * Honeypot field validator (for form spam protection)
 */
export function validateHoneypot(honeypotValue: string | undefined): boolean {
  // Honeypot field should be empty (bots usually fill all fields)
  return !honeypotValue || honeypotValue === '';
}
