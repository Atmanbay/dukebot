import { ChatInputApplicationCommandData, Embed } from "discord.js";
import moment from "moment-timezone";
import { TwitterApi } from "twitter-api-v2";
import config from "../../../../utils/config.js";

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

export const buildTweetEmbed = async (tweetId: string) => {
  const tweet = await client.singleTweet(tweetId, { tweet_mode: "extended" });

  let embed = {
    author: {
      name: `${tweet.user.name} (@${tweet.user.screen_name})`,
      iconURL: tweet.user.profile_image_url_https,
      url: `https://twitter.com/${tweet.user.screen_name}/status/${tweetId}`,
    },
    description: tweet.full_text,
    fields: [
      {
        name: "Likes",
        value: tweet.favorite_count.toString(),
        inline: true,
      },
      {
        name: "Retweets",
        value: tweet.retweet_count.toString(),
        inline: true,
      },
    ],
    footer: {
      text: moment(tweet.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format(
        "MM/DD/YYYY HH:mma"
      ),
    },
  };

  if (tweet.entities.media && tweet.entities.media.length > 0) {
    embed["image"] = { url: tweet.entities.media[0].media_url };
  }

  return embed as Embed;
};
