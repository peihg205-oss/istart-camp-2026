import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://lvhwrsicajvocncvwykz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aHdyc2ljYWp2b2NuY3Z3eWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzcxODAsImV4cCI6MjEwNTg1MzE4MH0.9inBxLjiByP6zHis12uUbCHtiexIVSGbrxDyz14bkkY'
);

async function main() {
  const { data: teams } = await supabase.from('teams').select('*').order('code');
  const { data: acts } = await supabase.from('activities').select('*, scoring_rules(*)').order('display_order');
  const { data: txs } = await supabase.from('score_transactions').select('*').order('created_at', { ascending: false });
  const { data: logs } = await supabase.from('score_audit_logs').select('*').order('created_at', { ascending: false });

  console.log('Fetched: teams=', teams?.length, 'acts=', acts?.length, 'txs=', txs?.length, 'logs=', logs?.length);
  fs.writeFileSync('scripts/live_backup.json', JSON.stringify({ teams, acts, txs, logs }, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
