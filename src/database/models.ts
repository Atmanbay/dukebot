export type BaseDatabaseObject = {
  id: string;
  created?: number;
};

export type InteractionContext = BaseDatabaseObject & {
  interactionId: string;
  context: any;
};

export type BotConfig = BaseDatabaseObject & {
  key: string;
  value: string;
};

export type MessageContent = BaseDatabaseObject & {
  userId: string;
  content: string;
};
