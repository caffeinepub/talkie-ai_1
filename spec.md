# Talkie AI

## Current State
The project is a blank scaffold with an empty `src/frontend/src/` directory. No frontend code exists. The backend and frontend need to be built from scratch.

## Requested Changes (Diff)

### Add
- User account creation and login (via Internet Identity / authorization component)
- Home/discover page showing a grid of popular fictional AI characters (from anime, games, movies, TV)
- Character chat page: one-on-one conversation UI with a selected AI character (simulated responses using character persona)
- Character maker: form to create a custom AI character with fields for name, description, personality, gender (male/female/non-binary), avatar upload, and whether they allow romance
- User profile page showing created characters and chat history
- Content restrictions: violence/gore and explicit sexual content blocked; romance/flirting allowed
- Characters displayed with avatar, name, fandom, short bio, and a "Chat" button
- Pre-seeded roster of ~10 popular fictional characters (e.g. Naruto, Goku, Sherlock Holmes, Hermione Granger, Tony Stark, Daenerys Targaryen, Light Yagami, Mikasa Ackerman, Levi Ackerman, Jinx from Arcane)

### Modify
- Nothing (greenfield)

### Remove
- Nothing

## Implementation Plan
1. Backend (Motoko):
   - User profile storage (linked to Internet Identity principal)
   - Character data type: id, name, fandom, description, personality, gender, allowsRomance, avatarUrl, isOfficial (pre-seeded), creatorId
   - Chat message storage per (user, character) pair
   - Functions: getCharacters, getCharacter, createCharacter, getChatHistory, sendMessage (stores message + returns simulated AI reply based on character persona), getUserProfile
2. Frontend:
   - Layout with nav bar (logo, Home, My Characters, Profile, Login/Logout)
   - Home page: search/filter bar + character grid cards
   - Chat page: chat bubble UI, message input, character header
   - Character maker page: form with all fields
   - Profile page: user's created characters + recent chats
   - Auth gate: prompt login for chatting or creating characters
