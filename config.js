let getEnvironmentVariable = function(name) {
    let value = process.env[name];
    if (!value)
        throw(`Environment variable ${name} is not set`);

    return value;
}

let config = {}
if (getEnvironmentVariable('NODE_ENV') === 'production') {
    config.prefix = getEnvironmentVariable('DUKE_PROD_COMMAND_PREFIX');
} else {
    config.prefix = getEnvironmentVariable('DUKE_DEV_COMMAND_PREFIX');
}

config.token = getEnvironmentVariable('DUKE_DISCORD_TOKEN');
config.paths = {
    'audio': getEnvironmentVariable('DUKE_AUDIO_PATH'),
    'database': getEnvironmentVariable('DUKE_DATABASE_PATH'),
    'logging': getEnvironmentVariable('DUKE_LOGGING_PATH')
}

config.dbDefaults = {
    "jobs": [
    ],
    "blazes": [
    ],
    "messages": [
    ],
    "responses": [
    ],
    "walkups": [
    ]
}

export default config;