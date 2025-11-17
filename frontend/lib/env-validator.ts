/**
 * Environment Variable Validator
 * Checks for required environment variables and provides helpful error messages
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvConfig[] = [
  // Supabase (Required for app to function)
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (for server-side operations)',
  },

  // Stripe (Required for payments)
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key (starts with sk_test_ or sk_live_)',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    description: 'Stripe webhook secret (for subscription updates)',
  },

  // Stripe Price IDs (Optional - fallback to defaults)
  {
    name: 'NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID',
    required: false,
    description: 'Stripe price ID for bride premium plan ($29.99)',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_VENDOR_PREMIUM_PRICE_ID',
    required: false,
    description: 'Stripe price ID for vendor premium plan ($49.99)',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_VENDOR_FEATURED_PRICE_ID',
    required: false,
    description: 'Stripe price ID for vendor featured plan ($99.99)',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_VENDOR_ELITE_PRICE_ID',
    required: false,
    description: 'Stripe price ID for vendor elite plan ($199.99)',
  },

  // OpenAI (Optional - for AI assistant)
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (for AI wedding assistant feature)',
  },

  // App URL (Optional - defaults to localhost)
  {
    name: 'NEXT_PUBLIC_URL',
    required: false,
    description: 'Public URL of the application (for redirects)',
  },
];

export function validateEnvironmentVariables() {
  const missing: EnvConfig[] = [];
  const warnings: EnvConfig[] = [];

  ENV_VARS.forEach((envVar) => {
    const value = process.env[envVar.name];

    if (!value || value === '') {
      if (envVar.required) {
        missing.push(envVar);
      } else {
        warnings.push(envVar);
      }
    }
  });

  return { missing, warnings };
}

export function logEnvironmentStatus() {
  const { missing, warnings } = validateEnvironmentVariables();

  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missing.forEach((envVar) => {
      console.error(`  - ${envVar.name}: ${envVar.description}`);
    });
    console.error('\nAdd these to your .env.local file or Vercel environment variables.');
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Optional environment variables not set:');
    warnings.forEach((envVar) => {
      console.warn(`  - ${envVar.name}: ${envVar.description}`);
    });
  }

  if (missing.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables configured correctly');
  }

  return missing.length === 0;
}

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus();
}
