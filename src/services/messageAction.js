const crypto = require("crypto");
const {
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");

const ButtonTypes = {
  GENERIC: 0,
  APPROVAL: 1,
  PAGINATION: 2,
};

module.exports = class {
  constructor(services) {
    this.guildService = services.guild;
    this.buttons = {};
    this.selects = {};
  }

  createButton({ id, type, onClick, label, style }) {
    this.buttons[id] = {
      id: id,
      type: type,
      onClick: onClick,
    };

    return new MessageButton().setCustomId(id).setLabel(label).setStyle(style);
  }

  createSelect({ id, onSelect, label, options }) {
    this.selects[id] = {
      id,
      onSelect,
    };

    return new MessageSelectMenu()
      .setCustomId(id)
      .setPlaceholder(label)
      .addOptions(
        options.map((option) => {
          return { label: option, value: option };
        })
      );
  }

  createApprovalButtons({ role, requiredApprovals, onSuccess, style }) {
    let buttons = [];
    let approvalId = crypto.randomBytes(16).toString("hex");
    let removeApprovalId = crypto.randomBytes(16).toString("hex");

    let approval = {
      requiredApprovals,
      role,
      currentApprovals: [],
      onSuccess,
    };

    approval.onApproval = async (interaction) => {
      let isCorrectRole = true;
      if (approval.role) {
        isCorrectRole = interaction.member.roles.cache.has(role.id);
      }

      if (!isCorrectRole) {
        await interaction.reply({
          content: "You are not the correct role",
          ephemeral: true,
        });
        return;
      }

      if (approval.currentApprovals.includes(interaction.member.id)) {
        await interaction.reply({
          content: "You have already approved this",
          ephemeral: true,
        });
        return;
      }

      approval.currentApprovals.push(interaction.member.id);
      if (approval.currentApprovals.length >= approval.requiredApprovals) {
        approval.onSuccess(interaction);
        delete this.buttons[approvalId];
        delete this.buttons[removeApprovalId];

        let messageContent = `This has been approved`;
        interaction.update({ content: messageContent, components: [] });
      } else {
        let messageContent = `This will be executed on ${approval.requiredApprovals} approvals from the ${approval.role.name} role (${approval.currentApprovals.length}/${approval.requiredApprovals})`;
        interaction.update(messageContent);
      }
    };

    approval.onRemoveApproval = async (interaction) => {
      let index = approval.currentApprovals.indexOf(interaction.member.id);
      if (index > -1) {
        approval.currentApprovals.splice(index, 1);
      }

      let messageContent = `This will be executed on ${approval.requiredApprovals} approvals from the ${approval.role.name} role (${approval.currentApprovals.length}/${approval.requiredApprovals})`;
      interaction.update(messageContent);
    };

    if (!style) {
      style = "PRIMARY";
    }

    buttons.push(
      this.createButton({
        id: approvalId,
        type: ButtonTypes.APPROVAL,
        onClick: approval.onApproval,
        label: "Approve",
        style,
      })
    );

    buttons.push(
      this.createButton({
        id: removeApprovalId,
        type: ButtonTypes.APPROVAL,
        onClick: approval.onRemoveApproval,
        label: "Remove Approval",
        style: "SECONDARY",
      })
    );

    let messageContent = `This will be executed on ${requiredApprovals} approvals from the ${role.name} role (0/${requiredApprovals})`;

    return { buttons, messageContent };
  }

  createAuthorButton({ author, label, onClick, style }) {
    let authorGating = (interaction) => {
      if (interaction.member.id == author) {
        onClick(interaction);
      } else {
        interaction.reply({
          content: "You must be the original caller of this action",
          ephemeral: true,
        });
      }
    };

    return this.createGenericButton({ label, onClick: authorGating, style });
  }

  createGenericButton({ label, onClick, style }) {
    let buttons = [];

    if (!style) {
      style = "PRIMARY";
    }

    buttons.push(
      this.createButton({
        id: crypto.randomBytes(16).toString("hex"),
        type: ButtonTypes.GENERIC,
        onClick,
        label,
        style,
      })
    );

    return { buttons };
  }

  createPaginationButtons({ pages, onPageChange, dropdowns }) {
    let actions = [];
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

    actions.push(
      this.createButton({
        id: crypto.randomBytes(16).toString("hex"),
        type: ButtonTypes.PAGINATION,
        onClick: goToFirstPage,
        label: "<<",
        style: "SECONDARY",
      })
    );

    actions.push(
      this.createButton({
        id: crypto.randomBytes(16).toString("hex"),
        type: ButtonTypes.PAGINATION,
        onClick: previousPage,
        label: "<",
        style: "SECONDARY",
      })
    );

    // dropdowns.forEach((dropdown) => {
    //   actions.push(
    //     this.createSelect({
    //       id: crypto.randomBytes(16).toString("hex"),
    //       onSelect: dropdown.onSelect,
    //       label: dropdown.label,
    //     })
    //   );
    // });

    actions.push(
      this.createButton({
        id: crypto.randomBytes(16).toString("hex"),
        type: ButtonTypes.PAGINATION,
        onClick: nextPage,
        label: ">",
        style: "SECONDARY",
      })
    );

    actions.push(
      this.createButton({
        id: crypto.randomBytes(16).toString("hex"),
        type: ButtonTypes.PAGINATION,
        onClick: goToLastPage,
        label: ">>",
        style: "SECONDARY",
      })
    );

    return { actions };
  }

  createMessageActionRow(...actions) {
    return new MessageActionRow().addComponents(actions);
  }

  async handle(interaction) {
    let customId = interaction.customId;
    if (interaction.isButton()) {
      let button = this.buttons[customId];
      if (button) {
        button.onClick(interaction);
      }

      return;
    } else if (interaction.isSelectMenu()) {
      let select = this.selects[customId];
      if (select) {
        select.onSelect();
      }
    }

    if (button.type == ButtonTypes.GENERIC) {
      this.handleGenericButton(button, interaction);
    } else if (button.type == ButtonTypes.APPROVAL) {
      this.handleRoleButton(button, interaction);
    } else if (button.type == ButtonTypes.PAGINATION) {
      this.handlePaginationButton(button, interaction);
    } else {
      interaction.reply({
        content: "Button cannot be handled",
        ephemeral: true,
      });
    }
  }

  async handleGenericButton(button, interaction) {
    button.onClick(interaction);
  }

  async handleRoleButton(button, interaction) {
    button.onClick(interaction);
    // let isCorrectRole = true;
    // if (button.roleId) {
    //   isCorrectRole = interaction.member.roles.cache.has(button.role.id);
    // }

    // if (!isCorrectRole) {
    //   await interaction.followUp({
    //     content: "You are not the correct role",
    //     ephemeral: true,
    //   });
    //   return;
    // }

    // button.approvals++;
    // if (button.approvals == button.requiredApprovals) {
    //   button.onApproval(interaction);
    //   delete this.buttons[button.id];

    //   let messageContent = `This has been approved`;
    //   interaction.update({ content: messageContent, components: [] });
    // } else {
    //   let messageContent = `This will be executed on ${button.requiredApprovals} approvals from the ${button.role.name} role (${button.approvals}/${button.requiredApprovals})`;
    //   interaction.update(messageContent);
    // }
  }

  async handlePaginationButton(button, interaction) {
    button.onClick(interaction);
  }
};
