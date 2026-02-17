declare const Urso: {
  logger: { info: (...args: unknown[]) => void };
};

class ModulesLogicMain {
  run(): void {
    Urso.logger.info('Modules.Logic.Main run');
  }
}

export default ModulesLogicMain;
