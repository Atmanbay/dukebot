const crypto = require("crypto");
const { MessageActionRow, MessageButton } = require("discord.js");

const ButtonTypes = {
  GENERIC: 0,
  ROLE: 1,
  PAGINATION: 2,
};

module.exports = class {
  constructor(services) {
    this.guildService = services.guild;
    this.buttons = {};
  }

  createRoleButton({ role, requiredApprovals, onApproval }) {
    let customId = crypto.randomBytes(16).toString("hex");
    this.buttons[customId] = {
      type: ButtonTypes.ROLE,
      role: role,
      approvals: 0,
      requiredApprovals,
      onApproval,
    };

    // let button = new MessageActionRow().addComponents(
    //   new MessageButton()
    //     .setCustomId(customId)
    //     .setLabel("Approve")
    //     .setStyle("PRIMARY")
    // );

    let button = new MessageButton()
      .setCustomId(customId)
      .setLabel("Approve")
      .setStyle("PRIMARY");

    let messageContent = `This will be executed on ${requiredApprovals} approvals from the ${role.name} role (0/${requiredApprovals})`;

    return { button, messageContent };
  }

  createAuthorButton({ author, contents, onClick }) {
    let authorGating = (interaction) => {
      if (interaction.member.id == author) {
        onClick(interaction);
      }
    };

    this.createGenericButton({ contents, onClick: authorGating });
  }

  createGenericButton({ contents, onClick }) {
    let customId = crypto.randomBytes(16).toString("hex");
    this.buttons[customId] = {
      type: ButtonTypes.GENERIC,
      onClick,
    };

    // let button = new MessageActionRow().addComponents(
    //   new MessageButton()
    //     .setCustomId(customId)
    //     .setLabel(contents)
    //     .setStyle("PRIMARY")
    // );

    let button = new MessageButton()
      .setCustomId(customId)
      .setLabel(contents)
      .setStyle("PRIMARY");

    return { button };
  }

  createPaginationButtons({ pages, onPageChange }) {
    let buttons = [];
    let pagination = {
      currentPage: 0,
      pages: pages,
      onPageChange,
    };

    let goToFirstPage = (interaction) => {
      pagination.currentPage = 0;
      onPageChange(interaction, pagination.pages[pagination.currentPage]);
    };

    let previousPage = (interaction) => {
      if (pagination.currentPage - 1 < 0) {
        onPageChange(interaction, pagination.pages[pagination.currentPage]);
        return;
      }

      pagination.currentPage -= 1;
      onPageChange(interaction, pagination.pages[pagination.currentPage]);
    };

    let nextPage = (interaction) => {
      if (pagination.currentPage + 1 >= pagination.pages.length) {
        onPageChange(interaction, pagination.pages[pagination.currentPage]);
        return;
      }

      pagination.currentPage += 1;
      onPageChange(interaction, pagination.pages[pagination.currentPage]);
    };

    let goToLastPage = (interaction) => {
      pagination.currentPage = pagination.pages.length - 1;
      onPageChange(interaction, pagination.pages[pagination.currentPage]);
    };

    let customId = crypto.randomBytes(16).toString("hex");
    this.buttons[customId] = {
      type: ButtonTypes.PAGINATION,
      onClick: goToFirstPage,
    };

    buttons.push(
      new MessageButton()
        .setCustomId(customId)
        .setLabel("<<")
        .setStyle("SECONDARY")
    );

    customId = crypto.randomBytes(16).toString("hex");
    this.buttons[customId] = {
      type: ButtonTypes.PAGINATION,
      onClick: previousPage,
    };

    buttons.push(
      new MessageButton()
        .setCustomId(customId)
        .setLabel("<")
        .setStyle("SECONDARY")
    );

    customId = crypto.randomBytes(16).toString("hex");
    this.buttons[customId] = {
      type: ButtonTypes.PAGINATION,
      onClick: nextPage,
    };

    buttons.push(
      new MessageButton()
        .setCustomId(customId)
        .setLabel(">")
        .setStyle("SECONDARY")
    );

    customId = crypto.randomBytes(16).toString("hex");
    this.buttons[customId] = {
      type: ButtonTypes.PAGINATION,
      onClick: goToLastPage,
    };

    buttons.push(
      new MessageButton()
        .setCustomId(customId)
        .setLabel(">>")
        .setStyle("SECONDARY")
    );

    return buttons;
  }

  createMessageActionRow(...buttons) {
    return new MessageActionRow().addComponents(buttons);
  }

  async handle(interaction) {
    let customId = interaction.customId;
    let button = this.buttons[customId];

    if (button.type == ButtonTypes.GENERIC) {
      this.handleGenericButton(button, interaction);
    } else if (button.type == ButtonTypes.ROLE) {
      this.handleRoleButton(button, interaction);
    } else if (button.type == ButtonTypes.PAGINATION) {
      this.handlePaginationButton(button, interaction);
    }
  }

  async handleGenericButton(button, interaction) {
    button.onClick(interaction);
  }

  async handleRoleButton(button, interaction) {
    let isCorrectRole = true;
    if (button.roleId) {
      isCorrectRole = interaction.member.roles.cache.has(button.role.id);
    }

    if (!isCorrectRole) {
      await interaction.followUp({
        content: "You are not the correct role",
        ephemeral: true,
      });
      return;
    }

    button.approvals++;
    if (button.approvals == button.requiredApprovals) {
      button.onApproval(interaction);
      delete this.buttons[customId];

      let messageContent = `This has been approved`;
      interaction.update({ content: messageContent, components: [] });
    } else {
      let messageContent = `This will be executed on ${button.requiredApprovals} approvals from the ${button.role.name} role (${button.approvals}/${button.requiredApprovals})`;
      interaction.update(messageContent);
    }
  }

  async handlePaginationButton(button, interaction) {
    button.onClick(interaction);
  }
};
