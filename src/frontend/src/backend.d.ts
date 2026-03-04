import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    id: bigint;
    content: string;
    userId: Principal;
    role: Variant_user_assistant;
    timestamp: bigint;
    characterId: bigint;
}
export interface Character {
    id: bigint;
    bio: string;
    personality: string;
    name: string;
    creatorId?: Principal;
    isOfficial: boolean;
    allowsRomance: boolean;
    avatarUrl: string;
    gender: Variant_female_male_nonBinary;
    fandom: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_female_male_nonBinary {
    female = "female",
    male = "male",
    nonBinary = "nonBinary"
}
export enum Variant_user_assistant {
    user = "user",
    assistant = "assistant"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCharacter(name: string, fandom: string, bio: string, personality: string, gender: Variant_female_male_nonBinary, allowsRomance: boolean, avatarUrl: string): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacter(id: bigint): Promise<Character | null>;
    getCharacters(): Promise<Array<Character>>;
    getChatHistory(characterId: bigint): Promise<Array<ChatMessage>>;
    getUserCharacters(): Promise<Array<Character>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfileLegacy(): Promise<{
        principal: Principal;
        characters: Array<Character>;
    }>;
    initializeApp(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(characterId: bigint, content: string): Promise<ChatMessage>;
}
