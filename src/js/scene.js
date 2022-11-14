import Phaser from 'phaser';

import cardsAtlasJson from '../assets/cards/cards.json';
import cardsAtlasPng from '../assets/cards/cards.png';
import restartImage from '../assets/gui/restart.png';
import cardsImage from '../assets/gui/cards.png';
import rankingImage from '../assets/gui/ranking.png';
import placeOgg from '../assets/cards/cardPlace.ogg';
import placeMp3 from '../assets/cards/cardPlace.mp3';

import { Table, TurnMode } from './model';
import { CardView, StackView, OpenStackView } from './views';


export class MainScene extends Phaser.Scene {
    _model: Table 
    _cardViews: Array<CardView>
    _stackViews: Arrau<StackView>

    constructor () {
        super();
        this._model = new Table();
        this._cardViews = [];
        this._stackViews = [];
    }

    preload () {
        this.load.atlas('cards', cardsAtlasPng, cardsAtlasJson);
        this.load.image('restart', restartImage);
        this.load.image('game-mode', cardsImage);
        this.load.image('ranking', rankingImage);
        this.load.audio('place',[placeOgg, placeMp3]); // problem on ios, use cordova plugin for audio
    }

    create () {
        this._stackViews = []
        .concat([
            new StackView(this._model.closedUnusedStack, this, 'cards', 'back', 0, 0, 10+70, 110),
            new OpenStackView(this._model.openUnusedStack, this, 'cards', 'back', 40, 50, 10+70+150, 110),
        ]).concat(
            this._model.resultStacks.map((v,k) => new StackView(v, this, 'cards', 'back', 0, 0, 10+70+150*(k+3), 110))
        ).concat(
            this._model.workStacks.map((v,k) => new StackView(v, this, 'cards', 'back', 0, 50, 10+70+150*k, 310))
        );
        const closedStackView = this._stackViews[0];
        closedStackView.on('pointerdown', (pointer) => { this._model.switchToNextUnusedCard() });

        this._cardViews.push( ... this._model.cards.map(c => new CardView(
            c, 
            this,
            this._stackViews,
            this._cardViews,
            "cards",
            ['spades', 'diamonds', 'clubs', 'hearts'][c.suit] + ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.rank],
            "back", 10 + c.rank * 50, 510 + c.suit*200
            ))
        );
    
        this._model.on("move", () => this.sound.play('place'));
        this._model.on("turnModeChanged", () => {
            console.log("turnModeChanged")

            switch (this._model._turnMode) {
                case TurnMode.Turn1:
                    this._stackViews[1].maxCardsCount = 1
                    this.changeModeBtn.setAlpha(0.5)
                    this.changeModeBtn.clearTint()
                    break;
            
                default:
                    this._stackViews[1].maxCardsCount = 3
                    this.changeModeBtn.setAlpha(1)
                    this.changeModeBtn.setTint(0xffff00)
                    break;
            }

            this._model.restart()
        })

        this._model.restart();

        let buttonHeight = 100
        let buttonPanelY = this.cameras.main.height - 30

        this.restartBtn = this.add.image(0, buttonPanelY, 'restart');
        this.restartBtn.scale = buttonHeight / this.restartBtn.height;
        this.restartBtn.setOrigin(0, 1);
        this.restartBtn.setInteractive();
        this.restartBtn.on("pointerdown", (pointer) => {this._model.restart();});

        this.changeModeBtn = this.add.image(buttonHeight + 60, buttonPanelY, 'game-mode');
        this.changeModeBtn.scale = buttonHeight / this.changeModeBtn.height;
        this.changeModeBtn.setOrigin(0, 1);
        this.changeModeBtn.setInteractive();
        this.changeModeBtn.setAlpha(0.5)
        this.changeModeBtn.on("pointerdown", (pointer) => {this._model.changeTurnMode();});

        this.showRankTableBtn = this.add.image((buttonHeight + 70) * 2, buttonPanelY, 'ranking');
        this.showRankTableBtn.scale = buttonHeight / this.showRankTableBtn.height;
        this.showRankTableBtn.setOrigin(0, 1);
        this.showRankTableBtn.setInteractive();
        this.showRankTableBtn.on("pointerdown", (pointer) => {this._model.restart();});
    }

    update() {
        for(var i = 0; i < this._cardViews.length; i++) {
            this._cardViews[i].update();
        }
    }
}