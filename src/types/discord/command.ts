import {
  ButtonInteraction,
  ChatInputApplicationCommandData,
  CommandInteraction,
} from "discord.js";
import { Button, MessageAction } from "../database.js";

type RunExecutor = (interaction: CommandInteraction) => Promise<void>;
export type ButtonExecutor = ({
  interaction,
  messageAction,
}: {
  interaction: ButtonInteraction;
  messageAction: MessageAction;
}) => Promise<void>;

export interface Command extends ChatInputApplicationCommandData {
  run: RunExecutor | Record<string, RunExecutor>;
  handleButton?: {
    [Key in Button["type"]]?: ButtonExecutor;
  };
}
