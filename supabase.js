
import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://tqemjyagvptvntncnqiv.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_5ueDIMy7xA5wnvvIQ8HjVw_nPrfcDws";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
