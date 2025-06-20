/*
  # Initial Database Schema Setup

  1. New Tables
    - `cards` - Stores collectible card information
    - `profiles` - User profile information
    - `user_mana` - User mana/currency tracking
    - `user_cards` - User's collected cards
    - `card_sale_transactions` - Card sale transaction history

  2. Custom Types
    - `card_rarity` enum for card rarity levels
    - `mana_value` enum for mana values

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for user access
    - Create triggers for automatic data management

  4. Functions
    - `generate_unique_card_id` - Generate unique card identifiers
    - `sell_card` - Handle card selling transactions
    - `set_card_mana_value` - Set mana value based on rarity
    - `set_unique_card_id` - Generate unique card ID on insert
    - `handle_new_user` - Create profile for new users
    - `handle_new_user_mana` - Initialize mana for new users
*/

-- Create custom types
CREATE TYPE card_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE mana_value AS ENUM ('legendary_500', 'epic_400', 'rare_300', 'common_100');

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
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_mana table
CREATE TABLE IF NOT EXISTS user_mana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mana integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create user_cards table
CREATE TABLE IF NOT EXISTS user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  card_id uuid NOT NULL REFERENCES cards(id),
  collected_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_roll_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  unique_card_id text DEFAULT ''::text NOT NULL,
  mana_value integer DEFAULT 0 NOT NULL,
  UNIQUE(user_id, card_id)
);

-- Create card_sale_transactions table
CREATE TABLE IF NOT EXISTS card_sale_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  user_id uuid NOT NULL,
  mana_value integer NOT NULL,
  sold_at timestamptz DEFAULT now(),
  status text DEFAULT 'PENDING'::text NOT NULL
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mana ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_sale_transactions ENABLE ROW LEVEL SECURITY;

-- Cards policies
CREATE POLICY "Cards are viewable by everyone"
  ON cards FOR SELECT
  TO public
  USING (true);

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- User mana policies
CREATE POLICY "Users can view their own mana"
  ON user_mana FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mana record"
  ON user_mana FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mana"
  ON user_mana FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User cards policies
CREATE POLICY "Anyone can view all user cards"
  ON user_cards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own cards"
  ON user_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cards"
  ON user_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON user_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Card sale transactions policies
CREATE POLICY "Users can view their own transactions"
  ON card_sale_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON card_sale_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_mana ON user_mana(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_cards_user_id_card_id_key ON user_cards(user_id, card_id);

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