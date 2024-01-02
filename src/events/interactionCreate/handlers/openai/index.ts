import { ChatInputApplicationCommandData } from "discord.js";
import OpenAI from "openai";
import { paywallBalances } from "../../../../database/database.js";

export const data: ChatInputApplicationCommandData = {
  name: "openai",
  description: "Interact with OpenAI's text or DALL-E engines",
};

export const openai = new OpenAI();

export const moderate = async (input: string): Promise<string[]> => {
  const response = await openai.moderations.create({
    input: input,
  });

  let categories = response.results[0].categories;
  let failedCategories = [];
  Object.keys(categories).forEach((key) => {
    let value: boolean = categories[key];
    if (value) {
      failedCategories.push(key);
    }
  });

  return failedCategories;
};

export const getBalance = (userId: string) => {
  let balance = paywallBalances.get((pb) => pb.userId === userId);
  if (balance) {
    return balance.balance;
  }

  return 0;
};

export const addBalance = async (userId: string, amount: number) => {
  let balance = paywallBalances.get((pb) => pb.userId === userId);
  balance.balance = balance.balance + amount;
  await paywallBalances.update(balance);
};
