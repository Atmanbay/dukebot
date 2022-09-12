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
  callerUserId: string;
  approvals: string[];
  required: number;
  content?: string;
  imageUrl?: string;
};

export type TwitterReplyMessageActionData = {
  command: "twitter";
  subcommand: "reply";
  callerUserId: string;
  approvals: string[];
  required: number;
  content?: string;
  targetTweetId: string;
  imageUrl?: string;
};

export type TwitterRetweetMessageActionData = {
  command: "twitter";
  subcommand: "retweet";
  callerUserId: string;
  approvals: string[];
  required: number;
  targetTweetId: string;
  imageUrl?: string;
};

export type TwitterQuoteTweetMessageActionData = {
  command: "twitter";
  subcommand: "quotetweet";
  callerUserId: string;
  approvals: string[];
  required: number;
  content?: string;
  targetTweetId: string;
  imageUrl?: string;
};

export type TriviaAdvanceMessageActionData = {
  command: "trivia";
  subcommand: "advance";
  triviaSessionId: string;
  questionIndex: number;
};

export type TriviaQuestionMessageActionData = {
  command: "trivia";
  subcommand: "question";
  triviaSessionId: string;
  questionIndex: number;
  answerIndex: number;
  expireTimestamp: number;
};

export type MessageActionData =
  | EmojiKitchenMessageActionData
  | AudioUploadMessageActionData
  | AudioListMessageActionData
  | TwitterTweetMessageActionData
  | TwitterReplyMessageActionData
  | TwitterRetweetMessageActionData
  | TwitterQuoteTweetMessageActionData
  | TriviaAdvanceMessageActionData
  | TriviaQuestionMessageActionData;
