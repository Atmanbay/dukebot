export type EmojiKitchenMessageActionData = {
  command: "emoji";
  subcommand: "combine";
  path: string;
  emojiName: string;
};

export type AudioUploadMessageActionData = {
  command: "audio";
  subcommand: "upload";
  clipName: string;
};

export type AudioListMessageActionData = {
  command: "audio";
  subcommand: "list";
  currentPage: number;
};

export type TwitterTweetMessageActionData = {
  command: "twitter";
  subcommand: "tweet";
  approvals: string[];
  required: number;
  content: string;
};

export type TwitterReplyMessageActionData = {
  command: "twitter";
  subcommand: "reply";
  approvals: string[];
  required: number;
  content: string;
  targetTweetId: string;
};

export type TwitterRetweetMessageActionData = {
  command: "twitter";
  subcommand: "retweet";
  approvals: string[];
  required: number;
  targetTweetId: string;
};

export type TwitterQuoteTweetMessageActionData = {
  command: "twitter";
  subcommand: "quotetweet";
  approvals: string[];
  required: number;
  content: string;
  targetTweetUrl: string;
};

export type MessageActionData =
  | EmojiKitchenMessageActionData
  | AudioUploadMessageActionData
  | AudioListMessageActionData
  | TwitterTweetMessageActionData
  | TwitterReplyMessageActionData
  | TwitterRetweetMessageActionData
  | TwitterQuoteTweetMessageActionData;
