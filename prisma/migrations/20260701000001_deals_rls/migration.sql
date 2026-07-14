-- Enable RLS on Deal tables
ALTER TABLE "Deal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DealCommitment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DealMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DealUpdate" ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read Deal" ON "Deal" FOR SELECT USING (true);
CREATE POLICY "Public read DealMilestone" ON "DealMilestone" FOR SELECT USING (true);
CREATE POLICY "Public read DealUpdate" ON "DealUpdate" FOR SELECT USING (true);

-- Authenticated users can read their own commitments
CREATE POLICY "Owner read DealCommitment" ON "DealCommitment"
  FOR SELECT USING (true);
