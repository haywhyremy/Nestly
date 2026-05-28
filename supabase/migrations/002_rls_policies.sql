-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- PROFILES: read own + household co-members, update own only
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT hm.user_id FROM household_members hm
      WHERE hm.household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- HOUSEHOLDS: select for members, insert for any authenticated user
CREATE POLICY "households_select" ON households FOR SELECT
  USING (id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "households_insert" ON households FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "households_update" ON households FOR UPDATE
  USING (id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

-- HOUSEHOLD MEMBERS: select for same-household, insert for members
CREATE POLICY "household_members_select" ON household_members FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "household_members_insert" ON household_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- BABIES: full CRUD for household members
CREATE POLICY "babies_select" ON babies FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "babies_insert" ON babies FOR INSERT
  WITH CHECK (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "babies_update" ON babies FOR UPDATE
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

-- EVENTS: select/insert for household members, update own only
CREATE POLICY "events_select" ON events FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "events_insert" ON events FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
    AND logged_by = auth.uid()
  );

CREATE POLICY "events_update" ON events FOR UPDATE
  USING (logged_by = auth.uid())
  WITH CHECK (logged_by = auth.uid());

-- INVITES: public read (anyone with code), insert for household members
CREATE POLICY "invites_select" ON invites FOR SELECT
  USING (true);

CREATE POLICY "invites_insert" ON invites FOR INSERT
  WITH CHECK (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "invites_update" ON invites FOR UPDATE
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));
