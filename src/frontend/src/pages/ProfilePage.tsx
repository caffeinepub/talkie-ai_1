import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Edit3,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  Save,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Variant_female_male_nonBinary } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetUserCharacters,
  useGetUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";

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

function getGenderIcon(gender: Variant_female_male_nonBinary) {
  if (gender === Variant_female_male_nonBinary.female) return "♀";
  if (gender === Variant_female_male_nonBinary.male) return "♂";
  return "⚧";
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: userCharacters, isLoading: charsLoading } =
    useGetUserCharacters();
  const saveProfileMutation = useSaveUserProfile();

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-4)}`
    : "";

  const copyPrincipal = async () => {
    if (!principal) return;
    await navigator.clipboard.writeText(principal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditName = () => {
    setNameInput(profile?.name ?? "");
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await saveProfileMutation.mutateAsync({ name: nameInput.trim() });
    setEditingName(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Sign in to View Profile
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Sign in to manage your profile and see your created characters.
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-primary hover:bg-primary/90 gap-2"
          data-ocid="profile.login.button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full py-10 px-4" data-ocid="profile.page">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <h1 className="font-display text-4xl font-extrabold mb-1">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and characters.
          </p>
        </motion.div>

        {/* Identity card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
          data-ocid="profile.card"
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/40 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {principal.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Display name */}
              <div className="mb-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter display name"
                      className="h-8 text-sm bg-card/80 border-border/60"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSaveName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      autoFocus
                      data-ocid="profile.name.input"
                    />
                    <Button
                      size="sm"
                      onClick={() => void handleSaveName()}
                      disabled={
                        saveProfileMutation.isPending || !nameInput.trim()
                      }
                      className="h-8 px-3 bg-primary hover:bg-primary/90 shrink-0"
                      data-ocid="profile.name.save_button"
                    >
                      {saveProfileMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingName(false)}
                      className="h-8 px-3 shrink-0"
                      data-ocid="profile.name.cancel_button"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : profileLoading ? (
                  <Skeleton
                    className="w-32 h-6"
                    data-ocid="profile.loading_state"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl">
                      {profile?.name ?? "Anonymous"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditName}
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      data-ocid="profile.name.edit_button"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Principal */}
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded">
                  {shortPrincipal}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void copyPrincipal()}
                  className="w-6 h-6 text-muted-foreground hover:text-foreground"
                  title="Copy full principal"
                  data-ocid="profile.copy.button"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Characters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              My Characters
              {userCharacters && (
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary border-primary/20 text-xs"
                >
                  {userCharacters.length}
                </Badge>
              )}
            </h2>
            <Link to="/create" data-ocid="profile.create.link">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create New
              </Button>
            </Link>
          </div>

          <Separator className="mb-4 bg-border/40" />

          {charsLoading ? (
            <div
              className="space-y-3"
              data-ocid="profile.characters.loading_state"
            >
              {(["s1", "s2", "s3"] as const).map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/20"
                >
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !userCharacters || userCharacters.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="profile.characters.empty_state"
            >
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-3">
                You haven't created any characters yet.
              </p>
              <Link to="/create" data-ocid="profile.create.empty.link">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Your First Character
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="profile.characters.list">
              {userCharacters.map((character, i) => {
                const gradientClass =
                  AVATAR_GRADIENTS[
                    Number(character.id) % AVATAR_GRADIENTS.length
                  ];
                return (
                  <motion.div
                    key={character.id.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/20 transition-colors group"
                    data-ocid={`profile.characters.item.${i + 1}`}
                  >
                    <Avatar className="w-12 h-12 rounded-xl shrink-0">
                      {character.avatarUrl ? (
                        <AvatarImage
                          src={character.avatarUrl}
                          alt={character.name}
                          className="object-cover object-top"
                        />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "text-white font-bold rounded-xl",
                          gradientClass,
                        )}
                      >
                        {character.name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {character.name}
                        </span>
                        {character.isOfficial && (
                          <Shield className="w-3 h-3 text-primary shrink-0" />
                        )}
                        {character.allowsRomance && (
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400/50 shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground shrink-0">
                          {getGenderIcon(character.gender)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {character.fandom}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void navigate({
                          to: "/chat/$characterId",
                          params: { characterId: character.id.toString() },
                        })
                      }
                      className="shrink-0 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-ocid={`profile.characters.chat.button.${i + 1}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
