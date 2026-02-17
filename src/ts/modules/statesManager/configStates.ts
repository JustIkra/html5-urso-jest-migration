import type { StatesConfig } from '../../types';

class ModulesStatesManagerConfigStates {
  public readonly singleton = true;
  public contents: StatesConfig;

  constructor() {
    this.contents = {
      START_GAME: {
        action: 'gameInit',
        nextState: ['IDLE'],
        callLimit: 1,
      },

      IDLE: { action: 'startSpin' },

      SPIN_START: {
        all: [
          { action: 'serverSpinRequest' },
          { action: 'slotMachineSpinStart' },
        ],
      },

      SPIN_FINISHING: { action: 'spin' },

      WINLINES_ANIMATE_ALL: { action: 'showWinlinesAnimationAll' },

      PICK_GAME1: {
        sequence: [
          { action: 'someAction' },
          { action: 'showPickGame' },
          { action: 'showBIGWin' },
        ],
        nextState: ['PICK_GAME2', 'PICK_GAME1', 'IDLE'],
      },

      PICK_GAME2: {
        sequence: [
          { action: 'showWheel' },
          { action: 'showBIGWin' },
        ],
        nextState: ['PICK_GAME1', 'IDLE'],
      },

      WINLINES_ANIMATE_BY_ONE: { action: 'showWinlinesAnimation' },

      GAMBLE: {
        race: [
          { action: 'playerLooseinGamble' },
          { action: 'playerCollectMoney' },
        ],
      },

      UPDATE_BALANCE: {
        race: [
          {
            all: [
              {
                sequence: [
                  { action: 'showWinPopup' },
                  { action: 'closeWinPopup' },
                ],
              },
              { action: 'counterUpdate' },
            ],
          },
          { action: 'playerPressSpace' },
          { action: 'playerPressSPIN' },
        ],
      },
    };
  }

  public get(): StatesConfig {
    return this.contents;
  }
}

export default ModulesStatesManagerConfigStates;
