# Dukebot

Discord bot written with Node and Typescript, using the [discord.js](https://github.com/discordjs/discord.js/) library

## Requirements

You'll need git and Node.js

## Good Resources

You should probably at least skim these before starting work

- https://discordjs.guide/
- https://discord.js.org/#/docs/main/stable/general/welcome

## Install

Use your preferred method of cloning and then run:

    $ npm install

## Configure app

Set environment variables seen in `.env.sample`

## Running the project locally

    $ npm run dev

It uses [nodemon](https://github.com/remy/nodemon) so it'll restart the app automatically once any changes are detected.

## Building the Docker container

To build the supplied Dockerfile first ensure that you're in the root directory of the project and then run:

    $ docker build -t $DUKEBOT_CONTAINER_NAME .

And then to run the container:

    $ docker run -d --name dukebot --env-file .env --mount type=bind,src=$FILE_DIRECTORY,dst=/app/files $DUKEBOT_CONTAINER_NAME
