/**
 * DANA Pre-flight Health Check
 * 
 * Validates that database schema matches shared TypeScript types.
 * Prevents "stacking" features without running migrations.
 * 
 * Run: npx tsx scripts/dana-preflight.ts
 * Or: pnpm --filter mobile exec tsx ../scripts/dana-preflight.ts
 */

import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials. Check your .env file.");
  console.error("   Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Required schema fields for each table
 * Add new fields here as you "stack" features
 */
const REQUIRED_SCHEMA: Record<string, string[]> = {
  profiles: [
    // Tiered Trust System
    "is_profile_complete",
    "is_verified",
    "verification_method",
    // Contextual Identity Framework
    "bio_social",
    "interests",
    "professional_intents",
    "seniority_level",
    "years_in_role",
    "industry",
    "headline",
    "bio_professional",
    "skills",
    "experience",
    // Calendar Integration
    "calendar_link_business",
    "calendar_link_social",
    "availability_sync_provider",
  ],
  meeting_requests: [
    "intent_type",
    "venue_id",
    "proposed_time",
    "message",
    "meeting_window_preference",
    "duration_minutes", // From 024 migration
    "status",
  ],
  venues: [
    "suitability_tags", // From 022 migration
    "business_amenities", // From 022 migration
  ],
  date_invites: [
    "duration_minutes", // From 024 migration
  ],
};

/**
 * Run preflight health check
 */
async function runPreflight() {
  console.log("🔍 DANA Pre-flight: Checking the stack...\n");

  let allPassed = true;
  const errors: string[] = [];

  // 1. Test database connection
  console.log("📡 Testing database connection...");
  const { data: testData, error: testError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (testError) {
    console.error(`❌ Database connection failed: ${testError.message}`);
    console.error("   Check your Supabase URL and anon key in .env");
    process.exit(1);
  }
  console.log("✅ Database reachable\n");

  // 2. Check each table's schema
  for (const [table, requiredColumns] of Object.entries(REQUIRED_SCHEMA)) {
    console.log(`📋 Checking table: ${table}`);

    const { data: columnData, error: rpcError } = await supabase.rpc("get_column_names", {
      target_table_name: table,
    });

    if (rpcError) {
      // Check if it's because the helper function doesn't exist
      if (rpcError.message.includes("function") || rpcError.message.includes("does not exist")) {
        console.error(`❌ Helper function missing: ${rpcError.message}`);
        console.error(`   Run scripts/025_health_check_helper.sql in Supabase SQL Editor first!`);
        errors.push(`RPC function missing: Run 025_health_check_helper.sql`);
        allPassed = false;
        break; // Can't continue without the helper
      } else {
        console.error(`❌ Cannot access table "${table}": ${rpcError.message}`);
        errors.push(`Table ${table}: RPC error`);
        allPassed = false;
        continue;
      }
    }

    if (!columnData || columnData.length === 0) {
      console.error(`❌ Table "${table}" not found or has no columns`);
      errors.push(`Table ${table}: Not found`);
      allPassed = false;
      continue;
    }

    const existingColumns = columnData.map((c: any) => c.column_name.toLowerCase());
    const missingColumns: string[] = [];

    // Check each required column
    for (const col of requiredColumns) {
      const colLower = col.toLowerCase();
      if (existingColumns.includes(colLower)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.error(`   🚨 MISSING: ${col}`);
        missingColumns.push(col);
        allPassed = false;
      }
    }

    if (missingColumns.length > 0) {
      errors.push(`Table ${table}: Missing columns: ${missingColumns.join(", ")}`);
    }

    console.log(""); // Blank line between tables
  }

  // 3. Summary
  console.log("━".repeat(50));
  if (allPassed) {
    console.log("✨ All systems go. Stack is healthy.");
    console.log("   Safe to boot the dev server.\n");
    process.exit(0);
  } else {
    console.error("❌ Schema sync failed. Fix the following:\n");
    errors.forEach((err) => console.error(`   • ${err}`));
    console.error("\n💡 Run the missing migrations in Supabase SQL Editor:");
    console.error("   - scripts/020_dana_tiered_trust_system.sql");
    console.error("   - scripts/021_contextual_identity_framework.sql");
    console.error("   - scripts/022_venue_suitability_tags.sql");
    console.error("   - scripts/023_meeting_requests.sql");
    console.error("   - scripts/024_calendar_optimization_and_durations.sql");
    console.error("   - scripts/025_health_check_helper.sql\n");
    process.exit(1);
  }
}

// Run the check
runPreflight().catch((error) => {
  console.error("❌ Preflight script crashed:", error);
  process.exit(1);
});
