import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Heart, MessageCircle, Shield } from "lucide-react";
import { motion } from "motion/react";
import type { Character } from "../backend.d";
import { Variant_female_male_nonBinary } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface CharacterCardProps {
  character: Character;
  index: number;
  onLoginRequired?: () => void;
}

const AVATAR_GRADIENTS = [
  "avatar-gradient-1",
  "avatar-gradient-2",
  "avatar-gradient-3",
  "avatar-gradient-4",
  "avatar-gradient-5",
  "avatar-gradient-6",
  "avatar-gradient-7",
  "avatar-gradient-8",
];

const FANDOM_COLORS: Record<string, string> = {
  Marvel: "bg-red-500/20 text-red-300 border-red-500/30",
  "DC Comics": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Harry Potter": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Naruto: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Game of Thrones": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "Lord of the Rings":
    "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  "Star Wars": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Tomb Raider": "bg-green-500/20 text-green-300 border-green-500/30",
  "Sherlock Holmes": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Original: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function getFandomColor(fandom: string): string {
  return (
    FANDOM_COLORS[fandom] ?? "bg-primary/15 text-primary border-primary/25"
  );
}

function getGenderIcon(gender: Variant_female_male_nonBinary) {
  if (gender === Variant_female_male_nonBinary.female) return "♀";
  if (gender === Variant_female_male_nonBinary.male) return "♂";
  return "⚧";
}

export default function CharacterCard({
  character,
  index,
  onLoginRequired,
}: CharacterCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const gradientClass =
    AVATAR_GRADIENTS[Number(character.id) % AVATAR_GRADIENTS.length];

  const handleChat = () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    void navigate({
      to: "/chat/$characterId",
      params: { characterId: character.id.toString() },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl overflow-hidden border border-border/40 bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col"
      data-ocid={`characters.item.${index + 1}`}
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-b from-primary/5 to-transparent rounded-2xl" />

      {/* Avatar section */}
      <div className="relative h-44 overflow-hidden bg-muted/30">
        {character.avatarUrl ? (
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              gradientClass,
            )}
          >
            <span className="text-6xl font-display font-bold text-white/80">
              {character.name[0]}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card/90 to-transparent" />

        {/* Official badge */}
        {character.isOfficial && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/20 text-primary border-primary/30 text-xs"
            >
              <Shield className="w-3 h-3" />
              Official
            </Badge>
          </div>
        )}

        {/* Romance indicator */}
        {character.allowsRomance && (
          <div className="absolute top-2 left-2">
            <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/50" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + gender */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {character.name}
          </h3>
          <span
            className="text-muted-foreground text-sm shrink-0 mt-0.5"
            title={character.gender}
          >
            {getGenderIcon(character.gender)}
          </span>
        </div>

        {/* Fandom badge */}
        <div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getFandomColor(character.fandom),
            )}
          >
            {character.fandom}
          </Badge>
        </div>

        {/* Bio */}
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
          {character.bio}
        </p>

        {/* Chat button */}
        <Button
          onClick={handleChat}
          className="w-full mt-auto gap-2 bg-primary/90 hover:bg-primary text-primary-foreground font-semibold transition-all group-hover:glow-primary"
          size="sm"
          data-ocid={`characters.chat.button.${index + 1}`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat Now
        </Button>
      </div>
    </motion.article>
  );
}

// Skeleton card for loading state
export function CharacterCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/60 flex flex-col animate-pulse">
      <div className="h-44 bg-muted/40" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-6 bg-muted/40 rounded w-3/4" />
        <div className="h-5 bg-muted/30 rounded w-1/3" />
        <div className="h-4 bg-muted/30 rounded w-full" />
        <div className="h-4 bg-muted/30 rounded w-4/5" />
        <div className="h-9 bg-muted/30 rounded-lg mt-1" />
      </div>
    </div>
  );
}
