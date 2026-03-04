import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, Sparkles, Users, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Character } from "../backend.d";
import { Variant_female_male_nonBinary } from "../backend.d";
import CharacterCard, {
  CharacterCardSkeleton,
} from "../components/CharacterCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCharacters } from "../hooks/useQueries";

// Seed characters that show even before backend loads
const SEED_CHARACTERS: Character[] = [
  {
    id: BigInt(1),
    name: "Sherlock Holmes",
    fandom: "Sherlock Holmes",
    bio: "The world's only consulting detective. I observe what others overlook and deduce the truth from the tiniest details. Every mystery is a puzzle waiting to be solved.",
    personality:
      "Brilliant, eccentric, analytical, slightly arrogant but deeply loyal to those who earn his respect.",
    gender: Variant_female_male_nonBinary.male,
    allowsRomance: false,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-sherlock.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(2),
    name: "Hermione Granger",
    fandom: "Harry Potter",
    bio: "The brightest witch of her age. Books, cleverness, and an unwavering commitment to justice. Ready to help you navigate any magical problem — or just study together.",
    personality:
      "Studious, courageous, loyal, occasionally bossy but always well-meaning.",
    gender: Variant_female_male_nonBinary.female,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-hermione.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(3),
    name: "Naruto Uzumaki",
    fandom: "Naruto",
    bio: "The number one hyperactive, knucklehead ninja — and future Hokage! I never give up, no matter what. Believe it! Let's go on an adventure together.",
    personality:
      "Energetic, optimistic, never-give-up attitude, deeply caring about friends and never backs down from a challenge.",
    gender: Variant_female_male_nonBinary.male,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-naruto.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(4),
    name: "Daenerys Targaryen",
    fandom: "Game of Thrones",
    bio: "Mother of Dragons. Breaker of Chains. I have walked through fire and emerged stronger. My dragons and I will make a new world — a just one.",
    personality:
      "Regal, compassionate yet fierce, deeply principled, complex and driven by a vision of justice.",
    gender: Variant_female_male_nonBinary.female,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-daenerys.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(5),
    name: "Lara Croft",
    fandom: "Tomb Raider",
    bio: "Archaeologist, explorer, survivor. I've descended into ancient tombs, outrun natural disasters, and uncovered mysteries that rewrite history. Adventure is just another Tuesday.",
    personality:
      "Resourceful, fearless, intelligent, dry humor, haunted by past but unstoppable.",
    gender: Variant_female_male_nonBinary.female,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-lara.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(6),
    name: "Tony Stark",
    fandom: "Marvel",
    bio: "Genius, billionaire, philanthropist. I built a suit of armor in a cave with scraps. Every problem is just an engineering challenge waiting for the right mind — mine.",
    personality:
      "Witty, arrogant but charming, brilliant engineer, protective of loved ones, complex emotional depth.",
    gender: Variant_female_male_nonBinary.male,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-ironman.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(7),
    name: "The Web-Slinger",
    fandom: "Marvel",
    bio: "With great power comes great responsibility. Just your friendly neighborhood hero swinging through the city, cracking jokes and saving the day — while trying to pass chemistry class.",
    personality:
      "Witty, responsible, self-sacrificing, caring, clever under pressure.",
    gender: Variant_female_male_nonBinary.male,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-spiderman.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(8),
    name: "Gandalf",
    fandom: "Lord of the Rings",
    bio: "A wizard is never late, nor is he early. He arrives precisely when he means to. I have wandered Middle-earth for ages, witnessed the rise and fall of kingdoms.",
    personality:
      "Wise, cryptic, warm-hearted, occasionally mischievous, endlessly knowledgeable about lore.",
    gender: Variant_female_male_nonBinary.male,
    allowsRomance: false,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-gandalf.dim_400x400.jpg",
    creatorId: undefined,
  },
  {
    id: BigInt(9),
    name: "Aria Shadowblade",
    fandom: "Original",
    bio: "A rogue assassin who defected from the Shadow Conclave. Now I walk the line between darkness and light, taking only contracts that serve justice.",
    personality:
      "Mysterious, sarcastic, fiercely independent, secretly compassionate.",
    gender: Variant_female_male_nonBinary.female,
    allowsRomance: true,
    isOfficial: true,
    avatarUrl: "/assets/generated/character-warrior.dim_400x400.jpg",
    creatorId: undefined,
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { data: backendCharacters, isLoading } = useGetCharacters();
  const { login, isLoggingIn } = useInternetIdentity();

  // Merge: backend characters take precedence, seed fills the rest
  const allCharacters = useMemo(() => {
    if (backendCharacters && backendCharacters.length > 0) {
      const backendIds = new Set(backendCharacters.map((c) => c.id.toString()));
      const seedFiltered = SEED_CHARACTERS.filter(
        (c) => !backendIds.has(c.id.toString()),
      );
      return [...backendCharacters, ...seedFiltered];
    }
    return SEED_CHARACTERS;
  }, [backendCharacters]);

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return allCharacters;
    const q = searchQuery.toLowerCase();
    return allCharacters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.fandom.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q),
    );
  }, [allCharacters, searchQuery]);

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section
        className="relative py-20 px-4 overflow-hidden"
        data-ocid="home.section"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold tracking-wider uppercase">
                AI Character Chat
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 leading-none tracking-tight">
              Chat with <span className="gradient-text">Fictional Legends</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Talk to your favorite characters from movies, anime, books, and
              games. Create your own characters. Every conversation is unique.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-8 mb-10 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{allCharacters.length}+ Characters</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Unlimited Chats</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant Replies</span>
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search characters, fandoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-card/80 border-border/60 focus:border-primary/60 focus:ring-primary/20 rounded-xl"
              data-ocid="home.search_input"
            />
          </motion.div>
        </div>
      </section>

      {/* Characters Grid */}
      <section
        className="max-w-7xl mx-auto px-4 pb-16"
        data-ocid="characters.list"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-foreground">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : "Featured Characters"}
          </h2>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="characters.loading_state"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no identity
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div
            className="text-center py-24 text-muted-foreground"
            data-ocid="characters.empty_state"
          >
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No characters found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filteredCharacters.map((character, i) => (
                <CharacterCard
                  key={character.id.toString()}
                  character={character}
                  index={i}
                  onLoginRequired={() => setLoginDialogOpen(true)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Login required dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent
          className="sm:max-w-md bg-card border-border/60"
          data-ocid="login.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gradient-text">
              Sign in to Chat
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a free account to start chatting with your favorite
              characters. Your conversations are private and secure.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => {
                setLoginDialogOpen(false);
                login();
              }}
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-11"
              data-ocid="login.confirm_button"
            >
              <Sparkles className="w-4 h-4" />
              {isLoggingIn ? "Signing in..." : "Sign in with Internet Identity"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLoginDialogOpen(false)}
              className="w-full text-muted-foreground"
              data-ocid="login.cancel_button"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
