import { ChatInputApplicationCommandData } from "discord.js";
import { TwitterApi } from "twitter-api-v2";
import config from "../../../../utils/config";

export const data: ChatInputApplicationCommandData = {
  name: "twitter",
  description: "Tweet, reply, retweet, or quote tweet",
};

export const client = new TwitterApi({
  appKey: config.twitter.consumerKey,
  appSecret: config.twitter.consumerSecret,
  accessToken: config.twitter.accessTokenKey,
  accessSecret: config.twitter.accessTokenSecret,
}).v1;
