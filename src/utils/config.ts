const getEnvVar = (name: string) => {
  let value = process.env[name];
  if (!value) throw `Environment variable ${name} is not set`;

  return value;
};

const config = {
  isProduction: getEnvVar("NODE_ENV") === "production",
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
  twitter: {
    consumerKey: getEnvVar("TWITTER_CONSUMER_KEY"),
    consumerSecret: getEnvVar("TWITTER_CONSUMER_SECRET"),
    accessTokenKey: getEnvVar("TWITTER_ACCESS_TOKEN_KEY"),
    accessTokenSecret: getEnvVar("TWITTER_ACCESS_TOKEN_SECRET"),
  },
};

export default config;
