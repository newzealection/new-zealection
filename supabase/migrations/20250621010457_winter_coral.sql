/*
  # Complete database schema setup

  1. New Tables
    - `cards` - Store card information with rarity and location data
    - `profiles` - User profile information linked to auth.users
    - `user_mana` - Track user's mana currency
    - `user_cards` - User's collected cards with unique IDs
    - `card_sale_transactions` - Track card sales for mana

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Users can only access their own data where appropriate

  3. Functions and Triggers
    - Auto-generate unique card IDs
    - Auto-set mana values based on rarity
    - Handle new user registration
    - Card selling functionality
*/

-- Create custom types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE card_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mana_value AS ENUM ('legendary_500', 'epic_400', 'rare_300', 'common_100');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  image_url text NOT NULL,
  rarity card_rarity DEFAULT 'common'::card_rarity NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  card_code text DEFAULT ''::text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  season text DEFAULT '2024'::text NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create user_mana table
CREATE TABLE IF NOT EXISTS user_mana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  mana integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraint and unique constraint for user_mana if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_mana_user_id_fkey' 
    AND table_name = 'user_mana'
  ) THEN
    ALTER TABLE user_mana ADD CONSTRAINT user_mana_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_mana' 
    AND table_name = 'user_mana'
  ) THEN
    ALTER TABLE user_mana ADD CONSTRAINT unique_user_mana UNIQUE(user_id);
  END IF;
END $$;

-- Create user_cards table
CREATE TABLE IF NOT EXISTS user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_id uuid NOT NULL,
  collected_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_roll_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  unique_card_id text DEFAULT ''::text NOT NULL,
  mana_value integer DEFAULT 0 NOT NULL
);

-- Add foreign key constraints for user_cards if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_cards_user_id_fkey' 
    AND table_name = 'user_cards'
  ) THEN
    ALTER TABLE user_cards ADD CONSTRAINT user_cards_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_cards_card_id_fkey' 
    AND table_name = 'user_cards'
  ) THEN
    ALTER TABLE user_cards ADD CONSTRAINT user_cards_card_id_fkey 
    FOREIGN KEY (card_id) REFERENCES cards(id);
  END IF;
END $$;

-- Create card_sale_transactions table
CREATE TABLE IF NOT EXISTS card_sale_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  user_id uuid NOT NULL,
  mana_value integer NOT NULL,
  sold_at timestamptz DEFAULT now(),
  status text DEFAULT 'PENDING'::text NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mana ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_sale_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
CREATE POLICY "Cards are viewable by everyone"
  ON cards FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own mana" ON user_mana;
CREATE POLICY "Users can view their own mana"
  ON user_mana FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mana record" ON user_mana;
CREATE POLICY "Users can insert their own mana record"
  ON user_mana FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mana" ON user_mana;
CREATE POLICY "Users can update their own mana"
  ON user_mana FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view all user cards" ON user_cards;
CREATE POLICY "Anyone can view all user cards"
  ON user_cards FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own cards" ON user_cards;
CREATE POLICY "Users can insert their own cards"
  ON user_cards FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for users own cards" ON user_cards;
CREATE POLICY "Enable insert for users own cards"
  ON user_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own cards" ON user_cards;
CREATE POLICY "Users can view their own cards"
  ON user_cards FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for users own cards" ON user_cards;
CREATE POLICY "Enable read access for users own cards"
  ON user_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON user_cards;
CREATE POLICY "Users can delete their own cards"
  ON user_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_mana ON user_mana(user_id);

-- Create view for user cards with profiles
CREATE OR REPLACE VIEW user_cards_with_profiles AS
SELECT 
  uc.id,
  uc.user_id,
  uc.card_id,
  uc.collected_at,
  uc.last_roll_at,
  uc.unique_card_id,
  p.email as user_email,
  p.created_at as profile_created_at
FROM user_cards uc
LEFT JOIN profiles p ON uc.user_id = p.id;

-- Function to generate unique card ID
CREATE OR REPLACE FUNCTION generate_unique_card_id(card_code text, season text DEFAULT '2024')
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  counter integer;
  unique_id text;
BEGIN
  -- Get the current count for this card
  SELECT COUNT(*) INTO counter
  FROM user_cards uc
  JOIN cards c ON uc.card_id = c.id
  WHERE c.card_code = generate_unique_card_id.card_code;
  
  -- Generate unique ID
  unique_id := season || '-' || card_code || '-' || LPAD((counter + 1)::text, 4, '0');
  
  RETURN unique_id;
END;
$$;

-- Function to set card mana value based on rarity
CREATE OR REPLACE FUNCTION set_card_mana_value()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  card_rarity text;
BEGIN
  -- Get the card rarity
  SELECT rarity INTO card_rarity
  FROM cards
  WHERE id = NEW.card_id;
  
  -- Set mana value based on rarity
  CASE card_rarity
    WHEN 'legendary' THEN NEW.mana_value := 500;
    WHEN 'epic' THEN NEW.mana_value := 400;
    WHEN 'rare' THEN NEW.mana_value := 300;
    WHEN 'common' THEN NEW.mana_value := 100;
    ELSE NEW.mana_value := 100;
  END CASE;
  
  RETURN NEW;
END;
$$;

-- Function to set unique card ID
CREATE OR REPLACE FUNCTION set_unique_card_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  card_code_val text;
  season_val text;
BEGIN
  -- Get card code and season
  SELECT card_code, season INTO card_code_val, season_val
  FROM cards
  WHERE id = NEW.card_id;
  
  -- Generate unique card ID
  NEW.unique_card_id := generate_unique_card_id(card_code_val, season_val);
  
  RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Function to handle new user mana initialization
CREATE OR REPLACE FUNCTION handle_new_user_mana()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_mana (user_id, mana)
  VALUES (NEW.id, 1000)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function to sell a card
CREATE OR REPLACE FUNCTION sell_card(p_card_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  card_mana_value integer;
  current_mana integer;
BEGIN
  -- Get the mana value of the card
  SELECT mana_value INTO card_mana_value
  FROM user_cards
  WHERE id = p_card_id AND user_id = p_user_id;
  
  IF card_mana_value IS NULL THEN
    RAISE EXCEPTION 'Card not found or does not belong to user';
  END IF;
  
  -- Get current user mana
  SELECT mana INTO current_mana
  FROM user_mana
  WHERE user_id = p_user_id;
  
  IF current_mana IS NULL THEN
    current_mana := 0;
    INSERT INTO user_mana (user_id, mana)
    VALUES (p_user_id, 0);
  END IF;
  
  -- Create transaction record
  INSERT INTO card_sale_transactions (card_id, user_id, mana_value, status)
  VALUES (p_card_id, p_user_id, card_mana_value, 'COMPLETED');
  
  -- Update user mana
  UPDATE user_mana
  SET mana = current_mana + card_mana_value,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Delete the card from user's collection
  DELETE FROM user_cards
  WHERE id = p_card_id AND user_id = p_user_id;
  
  RETURN true;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_mana_value_trigger ON user_cards;
DROP TRIGGER IF EXISTS set_unique_card_id_trigger ON user_cards;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_mana ON auth.users;

-- Create triggers
CREATE TRIGGER set_mana_value_trigger
  BEFORE INSERT ON user_cards
  FOR EACH ROW
  EXECUTE FUNCTION set_card_mana_value();

CREATE TRIGGER set_unique_card_id_trigger
  BEFORE INSERT ON user_cards
  FOR EACH ROW
  EXECUTE FUNCTION set_unique_card_id();

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create trigger for new user mana initialization
CREATE TRIGGER on_auth_user_created_mana
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_mana();