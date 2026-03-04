import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Character, ChatMessage, UserProfile } from "../backend.d";
import { Variant_female_male_nonBinary } from "../backend.d";
import { useActor } from "./useActor";

// Re-export for convenience
export { Variant_female_male_nonBinary };

export function useGetCharacters() {
  const { actor, isFetching } = useActor();
  return useQuery<Character[]>({
    queryKey: ["characters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCharacters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCharacter(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Character | null>({
    queryKey: ["character", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCharacter(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetChatHistory(characterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chatHistory", characterId?.toString()],
    queryFn: async () => {
      if (!actor || characterId === null) return [];
      return actor.getChatHistory(characterId);
    },
    enabled: !!actor && !isFetching && characterId !== null,
  });
}

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserCharacters() {
  const { actor, isFetching } = useActor();
  return useQuery<Character[]>({
    queryKey: ["userCharacters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserCharacters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage(characterId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<ChatMessage, Error, string>({
    mutationFn: async (content: string) => {
      if (!actor || characterId === null) throw new Error("Not ready");
      return actor.sendMessage(characterId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", characterId?.toString()],
      });
    },
    onError: (error: Error) => {
      const msg = error.message?.toLowerCase() ?? "";
      if (
        msg.includes("moderat") ||
        msg.includes("not allowed") ||
        msg.includes("restricted")
      ) {
        toast.error("Message not allowed", {
          description: "This message was flagged by content moderation.",
        });
      } else {
        toast.error("Failed to send message", {
          description: "Please try again.",
        });
      }
    },
  });
}

export function useCreateCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    bigint,
    Error,
    {
      name: string;
      fandom: string;
      bio: string;
      personality: string;
      gender: Variant_female_male_nonBinary;
      allowsRomance: boolean;
      avatarUrl: string;
    }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCharacter(
        data.name,
        data.fandom,
        data.bio,
        data.personality,
        data.gender,
        data.allowsRomance,
        data.avatarUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["userCharacters"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile saved!");
    },
    onError: () => {
      toast.error("Failed to save profile");
    },
  });
}
