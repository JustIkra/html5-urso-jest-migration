class AppTemplatesScenesPlay {
  constructor() {
    const _atlasPath = 'atlases/';
    const _fontPath = 'fonts/';
    const _imagePath = 'images/';
    const _jsonPath = 'jsons/';
    const _spinePath = 'spines/';

    this.styles = {
      '^testContainer .test1': {
        x: 50, y: 50
      },
      '.alpha': {
        alpha: 0.5
      }
    }

    this.assets = [
      {
        type: Urso.types.assets.CONTAINER, id: 'playImages', contents: [
          { type: Urso.types.assets.IMAGE, key: 'aa_logo', path: _imagePath + 'test/aa_logo.png' },
          { type: Urso.types.assets.IMAGE, key: 'lava0', path: _imagePath + 'lava0.png' },
          { type: Urso.types.assets.IMAGE, key: 'lava1', path: _imagePath + 'lava1.png' },
          { type: Urso.types.assets.IMAGE, key: 'lava2', path: _imagePath + 'lava2.png' },
        ]
      },
      {
        type: Urso.types.assets.CONTAINER, id: 'buttonTest', contents: [
          { type: Urso.types.assets.IMAGE, key: 'b1_disable', path: _imagePath + 'test/b1_disable.png' },
          { type: Urso.types.assets.IMAGE, key: 'b1_out', path: _imagePath + 'test/b1_out.png' },
          { type: Urso.types.assets.IMAGE, key: 'b1_over', path: _imagePath + 'test/b1_over.png' },
          { type: Urso.types.assets.IMAGE, key: 'b1_press', path: _imagePath + 'test/b1_press.png' }
        ]
      },
      //{ type: Urso.types.assets.ATLAS, key: 'atlas1', path: _atlasPath + 'atlas1.json' },
      //{ type: Urso.types.assets.IMAGE, key: 'rock1', path: _atlasPath + 'rock.png'},
      //{ type: Urso.types.assets.IMAGE, key: 'rock2', path: _imagePath + 'rock.png'},
      { type: Urso.types.assets.BITMAPFONT, key: 'font1', path: _fontPath + 'bigWinFont.fnt' },
      { type: Urso.types.assets.JSON, key: 'json1', path: _jsonPath + 'json1.json', loadingGroup: 'lazyPart1' },
      { type: Urso.types.assets.SPINE, key: 'coin', path: _spinePath + 'coin.json' },

      {
        type: Urso.types.assets.CONTAINER, id: 'spineTest', contents: [
          { type: Urso.types.assets.IMAGE, key: '7', path: 'noAtlasSpine/7.png' },
          { type: Urso.types.assets.IMAGE, key: '7_light', path: 'noAtlasSpine/7_light.png' },
          { type: Urso.types.assets.IMAGE, key: 'sparkle', path: 'noAtlasSpine/sparkle.png' },
          { type: Urso.types.assets.SPINE, noAtlas: true, key: '7spine', path: 'noAtlasSpine/7.json' },
        ]
      },
    ];

    this.objects = [
      /*{
          type: Urso.types.objects.ATLASIMAGE,
          name: 'atlas1',
          class: 'atlas1',
          assetKey: 'atlas1',
          filenameKey: 'grass.png',
          x: 1600, y: 200,
          scaleX: 5, scaleY: 5
      },*/
      /*{
          type: Urso.types.objects.IMAGE,
          name: 'rock1',
          assetKey: 'rock1',
          x: 1200, y: 40,
          scaleX: 5, scaleY:5
      },*/
      /*{
          type: Urso.types.objects.IMAGE,
          name: 'rock2',
          assetKey: 'rock2',
          x: 1200, y: 40,
          scaleX: 5, scaleY:5
      },*/
      {
        type: Urso.types.objects.IMAGESANIMATION,
        name: 'lavaAnimation',
        assetKey: 'lava0',
        x: 900, y: 10,
        duration: 1000,
        loop: true,
        animationKeys: ['lava0', 'lava1', 'lava2'],
        autostart: true
      },
      /*{
          type: Urso.types.objects.MASK,
          name: 'testMask',
          rectangle: [0, 0, 1500, 1000],
          x: 75, y: 55
      },*/
      /*{
          type: Urso.types.objects.COMPONENT,
          name: 'bgCom',
          componentName: 'background',
          x: 10, y: 10
      },*/
      {
        type: Urso.types.objects.BUTTON,
        name: 'testBtn',
        buttonFrames: {
          over: 'b1_over',
          out: 'b1_out',
          pressed: 'b1_press',
          disabled: 'b1_disable'
        },
        x: 800, y: 10
      },
      {
        type: Urso.types.objects.IMAGE,
        name: 'lava22',
        assetKey: 'lava2',
        x: 600, y: 600
      },
      {
        type: Urso.types.objects.GROUP,
        name: 'testGroup',
        groupName: 'testGroup',
        x: 100, y: 100
      },
      {
        type: Urso.types.objects.COMPONENT,
        //name: 'testCom',
        componentName: 'test',
        options: { x: 50, text: 'test components text' },
        x: 100, y: 500
      },
      {
        type: Urso.types.objects.COMPONENT,
        name: 'spinButtonComponent',
        componentName: 'spinButton',
        x: 1800, y: 10
      },
      {
        type: Urso.types.objects.CONTAINER,
        name: 'testContainer', contents: [
          {
            type: Urso.types.objects.CONTAINER,
            name: 'testContainer2', class: "cl1 cl2", contents: [
              {
                type: Urso.types.objects.IMAGE,
                name: 'aa_logo',
                class: 'test1',
                assetKey: 'aa_logo'
              },
              {
                type: Urso.types.objects.IMAGE,
                name: 'lava0',
                class: 'test1 test2',
                assetKey: 'lava0',
                x: 400
              },
              {
                type: Urso.types.objects.IMAGE,
                name: 'lava1',
                assetKey: 'lava1',
                x: 0, y: 400
              },
              {
                type: Urso.types.objects.IMAGE,
                name: 'lava2',
                assetKey: 'lava2',
                x: 400, y: 400
              }
            ]
          }]
      },
      {
        type: Urso.types.objects.CONTAINER,
        name: 'spine', contents: [
          /*  {
                type: Urso.types.objects.SPINE,
                name: 'coinPro1',
                assetKey: 'coin',
                x: 1000, y: 500
            },
            {
                type: Urso.types.objects.SPINE,
                name: 'coinPro2',
                assetKey: 'coin',
                x: 1500, y: 500,
                animation: {
                    name: 'animation'
                }
            },
            {
                type: Urso.types.objects.SPINE,
                name: 'coinPro3',
                assetKey: 'coin',
                x: 1250, y: 800,
                animation: {
                    name: 'animation',
                    loop: true
                }
            }*/
        ]
      },
      {
        type: Urso.types.objects.CONTAINER,
        x: 50, y: 600,
        width: 300, height: 200,
        name: 'texts', contents: [
          {
            type: Urso.types.objects.TEXT,
            name: 'text1',
            text: 'Some111 test text',
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
          },
          {
            type: Urso.types.objects.TEXT,
            name: 'text2',
            text: 'Some222 test text',
            y: 150,
            fontFamily: 'Verdana',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'normal',
            fill: '#ff5733',
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
          },
          {
            type: Urso.types.objects.TEXT,
            name: 'text3',
            text: 'Some333 test text test text test last',
            y: 300,
            fontFamily: 'Helvetica',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bolder',
            fill: ['#56ff33', '#196908'], // gradient
            fillCustomColors: [
              { position: 5, color: '#ffffff' },
              { position: 10, color: '#ff5733' },
              { position: 15, color: '#56ff33' },
              { position: 26, color: '#00ff99' }
            ],
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
          }
        ]
      },
      {
        type: Urso.types.objects.BITMAPTEXT,
        name: 'text',
        fontName: 'font1',
        fontSize: 150,
        text: '123',
        //x: 200, y: 200,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 1,
        scaleY: 1,
        alignX: 'center',
        alignY: 'center',
        width: 300,

        transitionDelay: 500,
        transitionDuration: 2000,
        transitionProperty: 'alpha x y'
      },
      {
        type: Urso.types.objects.COMPONENT,
        name: 'redPushComponent',
        componentName: 'redPush'
      },
      {
        type: Urso.types.objects.COMPONENT,
        name: 'textingBeeComponent',
        componentName: 'textingBee'
      },
      {
        type: Urso.types.objects.COMPONENT,
        name: 'beeButtonComponent',
        componentName: 'beeButton'
      },
      {
        type: Urso.types.objects.COMPONENT,
        componentName: 'debug',
        scaleX: 2,
        scaleY: 2
      },
      /* {
           type: Urso.types.objects.SPINE,
           assetKey: '7spine',
           x: 1250, y: 1200,
           animation: {
               name: 'win',
               loop: true
           }
       }*/
    ];
  };

};

export default AppTemplatesScenesPlay;
