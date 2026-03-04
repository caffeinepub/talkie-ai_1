import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Lock,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../backend.d";
import { Variant_user_assistant } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCharacter,
  useGetChatHistory,
  useSendMessage,
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

export default function ChatPage() {
  const { characterId } = useParams({ from: "/chat/$characterId" });
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>(
    [],
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const charId = characterId ? BigInt(characterId) : null;

  const { data: character, isLoading: charLoading } = useGetCharacter(charId);
  const { data: chatHistory, isLoading: historyLoading } = useGetChatHistory(
    isAuthenticated ? charId : null,
  );
  const sendMessageMutation = useSendMessage(charId);

  const allMessages = [...(chatHistory ?? []), ...optimisticMessages];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll on new messages
  useEffect(scrollToBottom);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || sendMessageMutation.isPending) return;

    setInputValue("");

    // Optimistic user message
    const tempId = BigInt(Date.now());
    const tempUserMsg: ChatMessage = {
      id: tempId,
      content,
      userId: identity!.getPrincipal(),
      role: Variant_user_assistant.user,
      timestamp: BigInt(Date.now()),
      characterId: charId!,
    };
    setOptimisticMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await sendMessageMutation.mutateAsync(content);
      // Add assistant reply to optimistic list until query refetches
      setOptimisticMessages((prev) => [...prev, reply]);
    } catch {
      // Error handled in mutation's onError
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const gradientClass = character
    ? AVATAR_GRADIENTS[Number(character.id) % AVATAR_GRADIENTS.length]
    : "avatar-gradient-1";

  // Not authenticated overlay
  if (!isAuthenticated && !charLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Sign in to Chat
          </h2>
          <p className="text-muted-foreground max-w-sm">
            You need to sign in to start chatting with{" "}
            {character ? (
              <strong className="text-foreground">{character.name}</strong>
            ) : (
              "this character"
            )}
            .
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => void navigate({ to: "/" })}
            variant="outline"
            data-ocid="chat.back.button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-primary hover:bg-primary/90 gap-2"
            data-ocid="chat.login.button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]" data-ocid="chat.panel">
      {/* Chat Header */}
      <header className="glass border-b border-border/40 px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void navigate({ to: "/" })}
            className="text-muted-foreground hover:text-foreground shrink-0"
            data-ocid="chat.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {charLoading ? (
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
          ) : character ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                  {character.avatarUrl ? (
                    <AvatarImage
                      src={character.avatarUrl}
                      alt={character.name}
                      className="object-cover object-top"
                    />
                  ) : null}
                  <AvatarFallback
                    className={cn("text-white font-bold", gradientClass)}
                  >
                    {character.name[0]}
                  </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-base truncate">
                    {character.name}
                  </h2>
                  {character.isOfficial && (
                    <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                  {character.allowsRomance && (
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/50 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs py-0 h-4 bg-primary/10 text-primary border-primary/20"
                  >
                    {character.fandom}
                  </Badge>
                  <span className="text-xs text-emerald-500">Online</span>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Character not found</span>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" data-ocid="chat.list">
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
            {/* Welcome message */}
            {!historyLoading && allMessages.length === 0 && character && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
                data-ocid="chat.empty_state"
              >
                <div className="relative inline-block mb-4">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/30 mx-auto">
                    {character.avatarUrl ? (
                      <AvatarImage
                        src={character.avatarUrl}
                        alt={character.name}
                        className="object-cover object-top"
                      />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        "text-white text-2xl font-bold",
                        gradientClass,
                      )}
                    >
                      {character.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">
                  {character.name}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                  {character.bio.slice(0, 120)}...
                </p>
                <p className="text-primary text-sm mt-4 font-medium">
                  Say hello to start the conversation!
                </p>
              </motion.div>
            )}

            {historyLoading && (
              <div
                className="flex flex-col gap-4"
                data-ocid="chat.loading_state"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                  <MessageSkeleton key={i} isUser={i % 2 === 0} />
                ))}
              </div>
            )}

            <AnimatePresence initial={false}>
              {allMessages.map((msg, i) => (
                <MessageBubble
                  key={msg.id.toString()}
                  message={msg}
                  character={character}
                  gradientClass={gradientClass}
                  index={i}
                />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {sendMessageMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-2"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  {character?.avatarUrl ? (
                    <AvatarImage
                      src={character.avatarUrl}
                      alt={character?.name}
                      className="object-cover object-top"
                    />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      "text-white text-xs font-bold",
                      gradientClass,
                    )}
                  >
                    {character?.name[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border/40">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="glass border-t border-border/40 px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${character?.name ?? "..."}  (Enter to send)`}
              className="resize-none min-h-[44px] max-h-32 pr-4 bg-card/80 border-border/60 focus:border-primary/60 rounded-xl py-3 text-sm"
              rows={1}
              disabled={!isAuthenticated}
              data-ocid="chat.textarea"
            />
          </div>
          <Button
            onClick={() => void handleSend()}
            disabled={
              !inputValue.trim() ||
              sendMessageMutation.isPending ||
              !isAuthenticated
            }
            size="icon"
            className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 transition-all disabled:opacity-40"
            data-ocid="chat.submit_button"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-2 max-w-3xl mx-auto">
          AI characters may produce unexpected responses. Content moderation is
          active.
        </p>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  character: { name: string; avatarUrl: string } | null | undefined;
  gradientClass: string;
  index: number;
}

function MessageBubble({
  message,
  character,
  gradientClass,
  index,
}: MessageBubbleProps) {
  const isUser = message.role === Variant_user_assistant.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex items-end gap-2",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      data-ocid={`chat.item.${index + 1}`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 mb-1">
          {character?.avatarUrl ? (
            <AvatarImage
              src={character.avatarUrl}
              alt={character?.name}
              className="object-cover object-top"
            />
          ) : null}
          <AvatarFallback
            className={cn("text-white text-xs font-bold", gradientClass)}
          >
            {character?.name[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border/40 text-card-foreground rounded-bl-sm",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </motion.div>
  );
}

function MessageSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isUser && <Skeleton className="w-8 h-8 rounded-full shrink-0" />}
      <Skeleton className={cn("h-12 rounded-2xl", isUser ? "w-48" : "w-64")} />
    </div>
  );
}
