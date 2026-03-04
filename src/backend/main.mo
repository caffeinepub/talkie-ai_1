import List "mo:core/List";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Character = {
    id : Nat;
    name : Text;
    fandom : Text;
    bio : Text;
    personality : Text;
    gender : { #male; #female; #nonBinary };
    allowsRomance : Bool;
    avatarUrl : Text;
    isOfficial : Bool;
    creatorId : ?Principal;
  };

  type ChatMessage = {
    id : Nat;
    characterId : Nat;
    userId : Principal;
    role : { #user; #assistant };
    content : Text;
    timestamp : Int;
  };

  module Character {
    public func compareByName(c1 : Character, c2 : Character) : Order.Order {
      Text.compare(c1.name, c2.name);
    };
  };

  module ChatMessage {
    public func compareByTimestamp(m1 : ChatMessage, m2 : ChatMessage) : Order.Order {
      Int.compare(m1.timestamp, m2.timestamp);
    };
  };

  // State
  let characters = Map.empty<Nat, Character>();
  let chatMessages = Map.empty<Nat, ChatMessage>();
  var nextCharacterId = 1;
  var nextMessageId = 1;

  // Official characters data
  let officialCharacters : [Character] = [
    {
      id = 0;
      name = "Naruto Uzumaki";
      fandom = "Naruto";
      bio = "A ninja who seeks recognition from his peers and dreams of becoming the Hokage.";
      personality = "Energetic, determined, loyal";
      gender = #male;
      allowsRomance = true;
      avatarUrl = "https://example.com/naruto.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 1;
      name = "Goku";
      fandom = "Dragon Ball Z";
      bio = "A Saiyan who protects the Earth and loves a good fight.";
      personality = "Optimistic, brave, playful";
      gender = #male;
      allowsRomance = true;
      avatarUrl = "https://example.com/goku.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 2;
      name = "Sherlock Holmes";
      fandom = "Sherlock Holmes";
      bio = "A brilliant detective known for his logical reasoning.";
      personality = "Intellectual, observant, introverted";
      gender = #male;
      allowsRomance = true;
      avatarUrl = "https://example.com/sherlock.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 3;
      name = "Hermione Granger";
      fandom = "Harry Potter";
      bio = "A clever witch and close friend of Harry Potter.";
      personality = "Intelligent, resourceful, compassionate";
      gender = #female;
      allowsRomance = true;
      avatarUrl = "https://example.com/hermione.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 4;
      name = "Tony Stark";
      fandom = "Marvel";
      bio = "Genius, billionaire, playboy, philanthropist, and Iron Man.";
      personality = "Arrogant, witty, brilliant";
      gender = #male;
      allowsRomance = true;
      avatarUrl = "https://example.com/tony.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 5;
      name = "Daenerys Targaryen";
      fandom = "Game of Thrones";
      bio = "Mother of Dragons and a key player in the battle for the Iron Throne.";
      personality = "Ambitious, compassionate, strong-willed";
      gender = #female;
      allowsRomance = true;
      avatarUrl = "https://example.com/daenerys.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 6;
      name = "Light Yagami";
      fandom = "Death Note";
      bio = "A high school student who gains the power to kill anyone by writing their name in a notebook.";
      personality = "Intelligent, ambitious, manipulative";
      gender = #male;
      allowsRomance = true;
      avatarUrl = "https://example.com/light.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 7;
      name = "Mikasa Ackerman";
      fandom = "Attack on Titan";
      bio = "A skilled soldier and devoted friend of Eren Yeager.";
      personality = "Loyal, protective, stoic";
      gender = #female;
      allowsRomance = true;
      avatarUrl = "https://example.com/mikasa.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 8;
      name = "Levi Ackerman";
      fandom = "Attack on Titan";
      bio = "Captain of the Survey Corps and humanity's strongest soldier.";
      personality = "Reserved, strategic, disciplined";
      gender = #male;
      allowsRomance = true;
      avatarUrl = "https://example.com/levi.jpg";
      isOfficial = true;
      creatorId = null;
    },
    {
      id = 9;
      name = "Jinx";
      fandom = "Arcane";
      bio = "A manic and unpredictable criminal from Zaun.";
      personality = "Chaotic, creative, troubled";
      gender = #female;
      allowsRomance = true;
      avatarUrl = "https://example.com/jinx.jpg";
      isOfficial = true;
      creatorId = null;
    },
  ];

  public shared ({ caller }) func initializeApp() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the app");
    };

    for (character in officialCharacters.values()) {
      characters.add(character.id, character);
    };
    nextCharacterId := 10;
  };

  public query ({ caller }) func getCharacters() : async [Character] {
    let allCharacters = List.empty<Character>();

    for (char in characters.values()) {
      allCharacters.add(char);
    };

    allCharacters.toArray().sort(Character.compareByName);
  };

  public query ({ caller }) func getCharacter(id : Nat) : async ?Character {
    characters.get(id);
  };

  public shared ({ caller }) func createCharacter(
    name : Text,
    fandom : Text,
    bio : Text,
    personality : Text,
    gender : { #male; #female; #nonBinary },
    allowsRomance : Bool,
    avatarUrl : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create characters");
    };

    let character : Character = {
      id = nextCharacterId;
      name;
      fandom;
      bio;
      personality;
      gender;
      allowsRomance;
      avatarUrl;
      isOfficial = false;
      creatorId = ?caller;
    };
    characters.add(nextCharacterId, character);
    nextCharacterId += 1;
    character.id;
  };

  public query ({ caller }) func getChatHistory(characterId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access chat history");
    };

    let allMessages = chatMessages.values().toArray().map(func(msg) { ?msg });
    let filteredMessages = allMessages.map(
      func(msgOpt) {
        switch (msgOpt) {
          case (?msg) {
            if (msg.characterId == characterId and msg.userId == caller) {
              [msg];
            } else { [] };
          };
          case (null) { [] };
        };
      }
    );

    var result : [ChatMessage] = [];
    for (array in filteredMessages.values()) {
      result := result.concat(array);
    };
    result;
  };

  func containsExplicitContent(content : Text) : Bool {
    let lowerContent = content.map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );

    let explicitKeywords = [
      "sex", "fuck", "cock", "pussy", "dick", "penis", "vagina", "porn", "nude", "naked",
      "kill", "murder", "blood", "gore", "torture", "rape", "assault", "violence", "stab", "shoot"
    ];

    for (keyword in explicitKeywords.values()) {
      if (lowerContent.contains(#text keyword)) {
        return true;
      };
    };
    false;
  };

  public shared ({ caller }) func sendMessage(characterId : Nat, content : Text) : async ChatMessage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    if (containsExplicitContent(content)) {
      Runtime.trap("Content moderation: Message contains inappropriate explicit or violent content");
    };

    switch (characters.get(characterId)) {
      case (null) {
        Runtime.trap("Character not found");
      };
      case (?character) {
        let userMessage : ChatMessage = {
          id = nextMessageId;
          characterId;
          userId = caller;
          role = #user;
          content;
          timestamp = Time.now();
        };
        chatMessages.add(nextMessageId, userMessage);
        nextMessageId += 1;

        let aiResponse = "Hi, I'm " # character.name # "! " # character.personality;
        let assistantMessage : ChatMessage = {
          id = nextMessageId;
          characterId;
          userId = caller;
          role = #assistant;
          content = aiResponse;
          timestamp = Time.now();
        };
        chatMessages.add(nextMessageId, assistantMessage);
        nextMessageId += 1;

        assistantMessage;
      };
    };
  };

  public query ({ caller }) func getUserCharacters() : async [Character] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access their characters");
    };

    let allCharacters = characters.values().toArray().map(func(c) { ?c });
    let filteredCharacters = allCharacters.map(
      func(cOpt) {
        switch (cOpt) {
          case (?c) {
            switch (c.creatorId) {
              case (null) { [] };
              case (?creator) {
                if (creator == caller) {
                  [c];
                } else { [] };
              };
            };
          };
          case (null) { [] };
        };
      }
    );

    var result : [Character] = [];
    for (array in filteredCharacters.values()) {
      result := result.concat(array);
    };
    result.sort(Character.compareByName);
  };

  public query ({ caller }) func getUserProfileLegacy() : async {
    principal : Principal;
    characters : [Character];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access their profile");
    };

    let allCharacters = characters.values().toArray().map(func(c) { ?c });
    let filteredCharacters = allCharacters.map(
      func(cOpt) {
        switch (cOpt) {
          case (?c) {
            switch (c.creatorId) {
              case (null) { [] };
              case (?creator) {
                if (creator == caller) {
                  [c];
                } else { [] };
              };
            };
          };
          case (null) { [] };
        };
      }
    );

    var result : [Character] = [];
    for (array in filteredCharacters.values()) {
      result := result.concat(array);
    };

    {
      principal = caller;
      characters = result;
    };
  };
};
