import fs from 'node:fs';

const sql = fs.readFileSync('./supabase/migrations/20260921000000_init_scoring_system.sql', 'utf-8');

// Check all JSONB blocks
const jsonRegex = /'(\{[\s\S]*?\})'::jsonb/g;
let match;
let count = 0;

while ((match = jsonRegex.exec(sql)) !== null) {
  count++;
  try {
    const parsed = JSON.parse(match[1]);
    console.log(`✔ JSONB config #${count} is valid JSON (${Object.keys(parsed).join(', ')})`);
  } catch (err) {
    console.error(`❌ JSON error in block #${count}:`, err.message);
    process.exit(1);
  }
}

// Check key table definitions
const requiredTables = [
  'profiles',
  'teams',
  'activities',
  'scoring_rules',
  'score_transactions',
  'score_audit_logs',
];

for (const tbl of requiredTables) {
  if (sql.includes(`CREATE TABLE IF NOT EXISTS public.${tbl}`)) {
    console.log(`✔ Table public.${tbl} definition verified.`);
  } else {
    console.error(`❌ Missing table ${tbl}`);
    process.exit(1);
  }
}

// Check 14 teams seed
const teams = [
  'BDA', 'BEL', 'AIT', 'HELP', 'DB', 'AAI', 'IB',
  'AC', 'DC', 'ICE', 'ISEL', 'FDB', 'MIS', 'KEUKA',
];

for (const tm of teams) {
  if (sql.includes(`'${tm}'`)) {
    console.log(`✔ Team '${tm}' seed verified.`);
  } else {
    console.error(`❌ Missing team ${tm}`);
    process.exit(1);
  }
}

console.log('\n🎉 ALL DATABASE ARCHITECTURE REQUIREMENTS VERIFIED SUCCESSFULLY!');
