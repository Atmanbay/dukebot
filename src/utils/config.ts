const getEnvVar = (name: string) => {
  let value = process.env[name];
  if (!value) throw `Environment variable ${name} is not set`;

  return value;
};

const config = {
  isProduction: getEnvVar("NODE_ENV") === "production",
  fileExtension: getEnvVar("NODE_ENV") === "production" ? ".js" : ".ts",
  token: getEnvVar("DISCORD_TOKEN"),
  clientId: getEnvVar("DISCORD_CLIENT_ID"),
  serverId: getEnvVar("DISCORD_GUILD_ID"),
  paths: {
    audio: getEnvVar("PATHS_AUDIO"),
    database: getEnvVar("PATHS_DATABASE"),
    emojiKitchen: getEnvVar("PATHS_EMOJI_KITCHEN"),
    logging: getEnvVar("PATHS_LOGGING"),
  },
  emojis: {
    goodJob: getEnvVar("EMOJIS_GOOD_JOB"),
    badJob: getEnvVar("EMOJIS_BAD_JOB"),
  },
  roles: {
    admin: getEnvVar("ROLES_ADMIN"),
    twitter: getEnvVar("ROLES_TWITTER"),
  },
  approvals: {
    twitter: Number(getEnvVar("APPROVALS_REQUIRED_TWITTER")),
  },
  trivia: {
    maxPoints: Number(getEnvVar("TRIVIA_MAX_POINTS_PER_QUESTION")),
  },
  twitter: {
    consumerKey: getEnvVar("TWITTER_CONSUMER_KEY"),
    consumerSecret: getEnvVar("TWITTER_CONSUMER_SECRET"),
    accessTokenKey: getEnvVar("TWITTER_ACCESS_TOKEN_KEY"),
    accessTokenSecret: getEnvVar("TWITTER_ACCESS_TOKEN_SECRET"),
  },
  openAI: {
    apiKey: getEnvVar("OPENAI_API_KEY"),
  },
} as const;

export default config;
