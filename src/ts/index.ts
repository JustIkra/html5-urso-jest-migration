import './config/load';

// Main config
const CoreConfig = Urso.Core.Config as Record<string, unknown>;
Urso.config = CoreConfig.Main as typeof Urso.config;

// Function to run game with engine
const AppClass = Urso.Core.App as new () => { setup: typeof Urso.runGame };
Urso.runGame = new AppClass().setup;
