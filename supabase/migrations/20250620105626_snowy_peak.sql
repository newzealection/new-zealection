/*
  # Remove unique constraint on user_cards table

  1. Changes
    - Remove the unique constraint on (user_id, card_id) from user_cards table
    - This allows users to collect multiple instances of the same card type
    - Essential for a proper collectible card game experience

  2. Security
    - No changes to RLS policies
    - Existing security remains intact
*/

-- Remove the unique constraint that prevents users from collecting multiple instances of the same card
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;

-- Also remove the unique index if it exists
DROP INDEX IF EXISTS user_cards_user_id_card_id_key;