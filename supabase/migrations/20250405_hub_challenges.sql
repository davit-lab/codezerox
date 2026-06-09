-- Hub Challenges system
CREATE TABLE IF NOT EXISTS hub_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL DEFAULT 'Frontend',
  points integer NOT NULL DEFAULT 50,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed')),
  tasks text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS hub_challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES hub_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  completed boolean DEFAULT false,
  submission_url text,
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE hub_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_challenge_participants ENABLE ROW LEVEL SECURITY;

-- Policies: everyone can read challenges
CREATE POLICY "Anyone can view challenges"
  ON hub_challenges FOR SELECT
  USING (true);

-- Only admins can create/update/delete challenges
CREATE POLICY "Admins can manage challenges"
  ON hub_challenges FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Participants: anyone can read
CREATE POLICY "Anyone can view participants"
  ON hub_challenge_participants FOR SELECT
  USING (true);

-- Authenticated users can join challenges
CREATE POLICY "Users can join challenges"
  ON hub_challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update own participation"
  ON hub_challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can leave challenges
CREATE POLICY "Users can leave challenges"
  ON hub_challenge_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Insert some initial challenges
INSERT INTO hub_challenges (title, description, difficulty, category, points, deadline, status, tasks) VALUES
(
  'Landing Page',
  'HTML, CSS და JS-ით landing page-ის აწყობა. რესპონსივი დიზაინი, dark mode და smooth scroll.',
  'easy',
  'Frontend',
  50,
  now() + interval '14 days',
  'active',
  ARRAY['რესპონსივი layout (მობილური + დესკტოპი)', 'Dark/Light თემა', 'Smooth scroll', 'კონტაქტ ფორმა']
),
(
  'API Dashboard',
  'გარე API-დან მონაცემების წამოღება და ვიზუალიზაცია chart-ებით. ფილტრაცია და loading state-ები.',
  'medium',
  'Full Stack',
  100,
  now() + interval '21 days',
  'active',
  ARRAY['API-დან data fetch', 'Chart ვიზუალიზაცია', 'ფილტრაცია და ძიება', 'Loading/Error handling']
),
(
  'CLI Tool Node.js-ით',
  'Command line აპლიკაცია Node.js-ზე: ფაილ მენეჯერი, todo app ან API client.',
  'hard',
  'Backend',
  150,
  now() + interval '28 days',
  'upcoming',
  ARRAY['Interactive CLI', 'ფაილებთან მუშაობა', 'კონფიგურაციის მართვა', 'Error handling']
),
(
  'Portfolio საიტი',
  'პორტფოლიო ვებსაიტი შენი პროექტებით, უნარებით და კონტაქტ ფორმით.',
  'easy',
  'Frontend',
  50,
  now() - interval '7 days',
  'completed',
  ARRAY['პროექტების გალერეა', 'About სექცია', 'კონტაქტ ფორმა', 'ანიმაციები']
);
