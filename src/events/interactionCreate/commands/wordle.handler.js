const { SlashCommandBuilder } = require("@discordjs/builders");
const crypto = require("crypto");

module.exports = class {
  constructor(services) {
    this.guildService = services.guild;
    this.messageActionService = services.messageAction;
    this.wordleService = services.wordle;
    this.loggingService = services.logging;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("wordle")
      .setDescription("Do a wordle")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("start")
          .setDescription("Start a new Wordle session")
          .addIntegerOption((option) =>
            option
              .setName("length")
              .setDescription("Length of the word (default is 5)")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("guess")
          .setDescription("Guess the word")
          .addStringOption((option) =>
            option
              .setName("guess")
              .setDescription("Your guess")
              .setRequired(true)
          )
      );
  }

  async execute(interaction) {
    let subcommand = this[interaction.options.getSubcommand()];
    if (subcommand) {
      await subcommand.bind(this)(interaction);
    }
  }

  async start(interaction) {
    let length = interaction.options.getInteger("length");
    if (!length) {
      length = 5;
    }
    let userId = interaction.member.id;
    let currentWord = this.wordleService.getCurrentWord(userId);
    let assignNewWord = () =>
      this.wordleService.assignWord(userId, { length: length });

    if (currentWord) {
      let guesses = this.wordleService.getGuesses(userId);
      let hints = this.wordleService.getHints(userId);

      let win = !hints.known.includes("_");

      if (guesses.length === currentWord.length + 1 || win) {
        assignNewWord();
      } else {
        let { buttons } = this.messageActionService.createGenericButton({
          label: "Yes",
          onClick: (int) => {
            assignNewWord();
            int.reply({
              content: "Wordle session started! Guess with `/wordle guess`",
              ephemeral: true,
            });
          },
        });
        let buttonRow =
          this.messageActionService.createMessageActionRow(buttons);
        interaction.reply({
          content:
            "You're in the middle of a Wordle. Are you sure you want to start a new one?",
          components: [buttonRow],
          ephemeral: true,
        });
        return;
      }
    } else {
      assignNewWord();
    }

    interaction.reply({
      content: "Wordle session started! Guess with `/wordle guess`",
      ephemeral: true,
    });
  }

  async guess(interaction) {
    let win = false;
    let lose = false;
    let userId = interaction.member.id;

    let guess = interaction.options.getString("guess").toUpperCase();
    if (!this.wordleService.isValidGuess(userId, guess)) {
      interaction.reply({
        content:
          "Your guess must be a valid English word that you have not already guessed",
        ephemeral: true,
      });
      return;
    }

    let content = [];

    let currentWord = this.wordleService.getCurrentWord(userId);
    let guesses = this.wordleService.getGuesses(userId);
    let hints = this.wordleService.getHints(userId);
    if (guesses.length == currentWord.length + 1) {
      lose = true;
    } else if (hints.known.includes("_")) {
      if (!currentWord) {
        interaction.reply({
          content:
            "No Wordle session found. Please start one with `/wordle start`",
          ephemeral: true,
        });
        return;
      }

      this.wordleService.logGuess(userId, guess);
    }

    guesses = this.wordleService.getGuesses(userId);
    content.push(...guesses);
    hints = this.wordleService.getHints(userId);

    if (guesses.length == currentWord.length + 1) {
      lose = true;
    }

    win = !hints.known.includes("_");

    let nos = new Set();
    guesses.forEach((guess) => {
      guess.split("").forEach((letter) => {
        if (!(hints.known.includes(letter) || hints.unknown.includes(letter))) {
          nos.add(letter);
        }
      });
    });

    nos = Array.from(nos);
    nos.sort();

    content.push("");
    content.push(hints.known.join(" "));
    content.push(`HAS: ${hints.unknown.join(" ")}`);
    content.push(`GUESSED: ${nos.join(" ")}`);
    content.push("```");
    content.unshift("```");

    content.push(`${guesses.length}/${currentWord.length + 1} guesses made`);

    let buttonRow;
    if (win) {
      content.push("You won!");
    } else if (lose) {
      content.push(
        `The word was ${currentWord}. Start a new Wordle with \`/wordle start\``
      );
    }

    console.log(currentWord);

    if (win || lose) {
      let newButton = this.messageActionService.createGenericButton({
        label: "Start New Of Same Length",
        onClick: (int) => {
          this.wordleService.assignWord(userId, { length: currentWord.length });
          int.reply({
            content: "Wordle session started! Guess with `/wordle guess`",
            ephemeral: true,
          });
        },
      }).buttons;
      let publishButton = this.messageActionService.createGenericButton({
        label: "Publish Your Results",
        onClick: (int) => {
          let nickname = int.member.nickname;
          if (!nickname) {
            nickname = int.member.user.username;
          }
          let content = [
            `Wordle ${currentWord.length} ${guesses.length}/${
              currentWord.length + 1
            }`,
            "",
            nickname,
            `Hash: ${crypto
              .createHash("md5")
              .update(currentWord)
              .digest("hex")
              .substring(0, 6)}`,
            `Word: ||${currentWord}||`,
          ];
          guesses.forEach((guess) => {
            let guessEmojis = [];
            let guessArray = guess.split("");
            let wordArray = currentWord.split("");
            guessArray.forEach((letter, index) => {
              if (wordArray[index] === letter) {
                guessEmojis[index] = ":green_square:";
              } else if (wordArray.includes(letter)) {
                guessEmojis[index] = ":yellow_square:";
              } else {
                guessEmojis[index] = ":black_large_square:";
              }
            });

            content.push(guessEmojis.join(""));
          });
          let reply = {
            content: content.join("\n"),
          };

          let attemptButton = this.messageActionService.createGenericButton({
            label: "Attempt",
            onClick: (int) => {
              this.wordleService.assignWord(int.member.id, {
                word: currentWord,
              });

              int.reply({
                content: "Wordle session started! Guess with `/wordle guess`",
                ephemeral: true,
              });
            },
          }).buttons;

          reply.components = [
            this.messageActionService.createMessageActionRow(attemptButton),
          ];

          int.reply(reply);
        },
      }).buttons;
      buttonRow = this.messageActionService.createMessageActionRow(
        newButton,
        publishButton
      );
    }

    let reply = {
      content: content.join("\n"),
      ephemeral: true,
    };

    if (buttonRow) {
      reply.components = [buttonRow];
    }

    interaction.reply(reply);
  }
};
