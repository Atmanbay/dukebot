// import { lines } from "../../../database/database.js";
import { ApplicationCommandOptionType } from "discord.js";
import { InteractionCreateHandler } from "../index.js";

const BetInteractionCreateHandler: InteractionCreateHandler = {
  name: "bookie",
  description: "Create and manage lines and bets",
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: "line",
      description: "Open, lock, unlock, list, and close lines",
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "open",
          description: "Open a line with the provided description and choices",
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "lock",
          description: "Stop accepting bets on a specified line",
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "unlock",
          description:
            "Start accepting bets on a specified line again (lines are unlocked on creation)",
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "list",
          description: "List all current lines",
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "close",
          description: "Close a specified line (pay out",
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: "bet",
      description: "Place and list bets",
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "place",
          description: "",
        },
      ],
    },
  ],
  handle: {
    open: async (interaction) => {
      // lines.create({
      //   description: "",
      //   creatorUserId: "",
      //   locked: false,
      //   choices: [],
      //   bets: [],
      // });
    },
    lock: async (interaction) => {},
    unlock: async (interaction) => {},
    list: async (interaction) => {},
    close: async (interaction) => {},
    place: async (interaction) => {},
  },
};

export default BetInteractionCreateHandler;
