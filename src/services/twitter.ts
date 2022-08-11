import Twitter, { Params } from "twit";
import config from "../utils/config.js";
import { MessageEmbed } from "discord.js";
import moment from "moment-timezone";

export const buildEmbed = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return {
    title: title,
    description: content,
  } as MessageEmbed;
};

export const buildTweetEmbed = async (tweetId: string) => {
  const params: Params = {
    tweet_mode: "extended",
  };
  const tweet = await client.get(`statuses/show/${tweetId}`, params);
  if (tweet.resp.statusCode !== 200) {
    return null;
  }

  const data = tweet.data as {
    user: {
      name: string;
      screen_name: string;
      profile_image_url: string;
    };
    full_text: string;
    favorite_count: number;
    retweet_count: number;
    created_at: string;
    entities: {
      media: {
        media_url: string;
      }[];
    };
  };

  let embed = {
    author: {
      name: `${data.user.name} (@${data.user.screen_name})`,
      iconURL: data.user.profile_image_url,
      url: `https://twitter.com/${data.user.screen_name}/status/${tweetId}`,
    },
    description: data.full_text,
    fields: [
      {
        name: "Likes",
        value: data.favorite_count.toString(),
        inline: true,
      },
      {
        name: "Retweets",
        value: data.retweet_count.toString(),
        inline: true,
      },
    ],
    footer: {
      text: moment(data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format(
        "MM/DD/YYYY HH:mma"
      ),
    },
  } as MessageEmbed;

  if (data.entities.media && data.entities.media.length > 0) {
    embed.image = { url: data.entities.media[0].media_url };
  }

  return embed;
};

let client: Twitter;

export const tweet = async (status: string) => {
  let options = {
    status: status,
  };

  return client.post("statuses/update", options);
};

export const reply = async (status: string, targetTweetId: string) => {
  let options = {
    status: status,
    in_reply_to_status_id: targetTweetId,
  };

  return client.post("statuses/update", options);
};

export const retweet = async (tweetId: string) => {
  return client.post(`statuses/retweet/${tweetId}`, {});
};

export const quoteTweet = async (status: string, targetTweetUrl: string) => {
  let options = {
    status: `${status} ${targetTweetUrl}`,
  };

  return client.post("statuses/update", options);
};

export const setup = () => {
  client = new Twitter({
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token: config.twitter.accessTokenKey,
    access_token_secret: config.twitter.accessTokenSecret,
  });
};
