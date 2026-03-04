import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Heart,
  ImageIcon,
  Loader2,
  Lock,
  PlusCircle,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Variant_female_male_nonBinary } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCharacter } from "../hooks/useQueries";

const AVATAR_GRADIENTS = [
  "avatar-gradient-1",
  "avatar-gradient-2",
  "avatar-gradient-3",
  "avatar-gradient-4",
  "avatar-gradient-5",
];

interface FormData {
  name: string;
  fandom: string;
  bio: string;
  personality: string;
  gender: Variant_female_male_nonBinary;
  allowsRomance: boolean;
  avatarUrl: string;
}

interface FormErrors {
  name?: string;
  fandom?: string;
  bio?: string;
  personality?: string;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const createCharacterMutation = useCreateCharacter();

  const [form, setForm] = useState<FormData>({
    name: "",
    fandom: "",
    bio: "",
    personality: "",
    gender: Variant_female_male_nonBinary.female,
    allowsRomance: false,
    avatarUrl: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const previewGradient =
    AVATAR_GRADIENTS[form.name.length % AVATAR_GRADIENTS.length];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!form.fandom.trim()) newErrors.fandom = "Fandom/Universe is required";
    if (!form.bio.trim()) newErrors.bio = "Bio is required";
    else if (form.bio.trim().length < 20)
      newErrors.bio = "Bio must be at least 20 characters";
    if (!form.personality.trim())
      newErrors.personality = "Personality description is required";
    else if (form.personality.trim().length < 10)
      newErrors.personality = "Personality must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const newId = await createCharacterMutation.mutateAsync({
        name: form.name.trim(),
        fandom: form.fandom.trim(),
        bio: form.bio.trim(),
        personality: form.personality.trim(),
        gender: form.gender,
        allowsRomance: form.allowsRomance,
        avatarUrl: form.avatarUrl.trim(),
      });
      void navigate({
        to: "/chat/$characterId",
        params: { characterId: newId.toString() },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Sign in to Create
          </h2>
          <p className="text-muted-foreground max-w-sm">
            You need to sign in to create custom AI characters.
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-primary hover:bg-primary/90 gap-2"
          data-ocid="create.login.button"
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
    <div className="min-h-full py-10 px-4" data-ocid="create.page">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-primary" />
            </div>
            <span className="text-primary text-sm font-semibold">
              Character Maker
            </span>
          </div>
          <h1 className="font-display text-4xl font-extrabold mb-2">
            Create a Character
          </h1>
          <p className="text-muted-foreground">
            Bring your favorite character to life or create an original one. Set
            their personality, background, and more.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-6"
          data-ocid="create.panel"
        >
          {/* Avatar preview + URL */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg mb-4">
              Character Preview
            </h2>
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <Avatar className="w-24 h-24 ring-2 ring-primary/30">
                  {form.avatarUrl ? (
                    <AvatarImage
                      src={form.avatarUrl}
                      alt={form.name}
                      className="object-cover object-top"
                    />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      "text-white text-3xl font-bold",
                      previewGradient,
                    )}
                  >
                    {form.name ? (
                      form.name[0].toUpperCase()
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-lg truncate">
                  {form.name || "Character Name"}
                </p>
                <p className="text-muted-foreground text-sm truncate">
                  {form.fandom || "Fandom / Universe"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {form.allowsRomance && (
                    <span className="flex items-center gap-1 text-xs text-rose-400">
                      <Heart className="w-3 h-3 fill-rose-400" />
                      Romance
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {form.gender === Variant_female_male_nonBinary.female
                      ? "Female ♀"
                      : form.gender === Variant_female_male_nonBinary.male
                        ? "Male ♂"
                        : "Non-Binary ⚧"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-lg">
              Basic Information
            </h2>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Character Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Elara Nightfall"
                className={cn(
                  "bg-card/80 border-border/60 focus:border-primary/60",
                  errors.name && "border-destructive focus:border-destructive",
                )}
                maxLength={60}
                data-ocid="create.name.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="create.name.error_state"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Fandom */}
            <div className="space-y-2">
              <Label htmlFor="fandom" className="text-sm font-medium">
                Fandom / Universe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fandom"
                value={form.fandom}
                onChange={(e) => updateField("fandom", e.target.value)}
                placeholder="e.g. Original, Harry Potter, Star Wars..."
                className={cn(
                  "bg-card/80 border-border/60 focus:border-primary/60",
                  errors.fandom &&
                    "border-destructive focus:border-destructive",
                )}
                maxLength={50}
                data-ocid="create.fandom.input"
              />
              {errors.fandom && (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="create.fandom.error_state"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.fandom}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(val) =>
                  updateField("gender", val as Variant_female_male_nonBinary)
                }
              >
                <SelectTrigger
                  className="bg-card/80 border-border/60 focus:border-primary/60"
                  data-ocid="create.gender.select"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  <SelectItem value={Variant_female_male_nonBinary.female}>
                    Female ♀
                  </SelectItem>
                  <SelectItem value={Variant_female_male_nonBinary.male}>
                    Male ♂
                  </SelectItem>
                  <SelectItem value={Variant_female_male_nonBinary.nonBinary}>
                    Non-Binary ⚧
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label
                htmlFor="avatarUrl"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Avatar Image URL
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="avatarUrl"
                value={form.avatarUrl}
                onChange={(e) => updateField("avatarUrl", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-card/80 border-border/60 focus:border-primary/60"
                type="url"
                data-ocid="create.avatarUrl.input"
              />
            </div>
          </div>

          {/* Character Details */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-lg">
              Character Details
            </h2>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                Short Bio <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="A brief description of who this character is..."
                className={cn(
                  "bg-card/80 border-border/60 focus:border-primary/60 resize-none",
                  errors.bio && "border-destructive",
                )}
                rows={3}
                maxLength={500}
                data-ocid="create.bio.textarea"
              />
              <div className="flex justify-between items-center">
                {errors.bio ? (
                  <p
                    className="text-xs text-destructive flex items-center gap-1"
                    data-ocid="create.bio.error_state"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.bio}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {form.bio.length}/500
                </span>
              </div>
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <Label htmlFor="personality" className="text-sm font-medium">
                Personality <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="personality"
                value={form.personality}
                onChange={(e) => updateField("personality", e.target.value)}
                placeholder="Describe how this character speaks, behaves, and thinks..."
                className={cn(
                  "bg-card/80 border-border/60 focus:border-primary/60 resize-none",
                  errors.personality && "border-destructive",
                )}
                rows={4}
                maxLength={1000}
                data-ocid="create.personality.textarea"
              />
              <div className="flex justify-between items-center">
                {errors.personality ? (
                  <p
                    className="text-xs text-destructive flex items-center gap-1"
                    data-ocid="create.personality.error_state"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.personality}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {form.personality.length}/1000
                </span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Settings</h2>

            {/* Romance toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label
                  htmlFor="allowsRomance"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  Allow Romance
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enable romantic storylines and interactions with this
                  character.
                </p>
              </div>
              <Switch
                id="allowsRomance"
                checked={form.allowsRomance}
                onCheckedChange={(val) => updateField("allowsRomance", val)}
                data-ocid="create.allowsRomance.switch"
              />
            </div>

            {/* Content notice */}
            <Alert className="bg-muted/30 border-border/40">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-xs text-muted-foreground">
                Characters must comply with community guidelines. Harmful,
                illegal, or explicitly sexual content is not allowed. Romance
                and mature themes (age 17+) are permitted within moderation
                limits.
              </AlertDescription>
            </Alert>
          </div>

          {/* Submit */}
          {createCharacterMutation.isError && (
            <Alert variant="destructive" data-ocid="create.error_state">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to create character. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={createCharacterMutation.isPending}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base gap-2 glow-primary"
            data-ocid="create.submit_button"
          >
            {createCharacterMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Character...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create & Start Chatting
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
