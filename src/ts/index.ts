declare const Urso: {
  Core: {
    Config: { Main: Record<string, unknown> };
    App: new () => { setup: () => Promise<void> };
  };
  config: Record<string, unknown>;
  runGame: () => Promise<void>;
};

// Note: In the full build, config/load.ts would be imported here
// to assemble the Urso.Core namespace. For the TS migration,
// this barrel import is deferred until all JS modules are removed.

// Main config
Urso.config = Urso.Core.Config.Main;

// Function to run game with engine
Urso.runGame = new Urso.Core.App().setup;

export default {};
