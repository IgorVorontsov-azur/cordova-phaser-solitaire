import Phaser from 'phaser';

import cardsAtlasJson from '../assets/cards/cards.json';
import cardsAtlasPng from '../assets/cards/cards.png';
import restartImage from '../assets/gui/restart.png';
import cardsImage from '../assets/gui/cards.png';
import rankingImage from '../assets/gui/ranking.png';
import placeOgg from '../assets/cards/cardPlace.ogg';
import placeMp3 from '../assets/cards/cardPlace.mp3';
import nameForm from '../assets/html/name-form.html';

import { Table, TurnMode } from './model';
import { CardView, StackView, OpenStackView, RecordsView } from './views';


export class MainScene extends Phaser.Scene {
    _model: Table 
    _cardViews: Array<CardView>
    _stackViews: Arrau<StackView>
    _recordsView: RecordsView

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
        this.load.html('nameform', nameForm);
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
        this._model.on("win", () => {
            this._showNameForm()
        })

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

        this._recordsView = new RecordsView(this);
        this.showRankTableBtn = this.add.image((buttonHeight + 70) * 2, buttonPanelY, 'ranking');
        this.showRankTableBtn.scale = buttonHeight / this.showRankTableBtn.height;
        this.showRankTableBtn.setOrigin(0, 1);
        this.showRankTableBtn.setInteractive();
        this.showRankTableBtn.on("pointerdown", (pointer) => {
            this._recordsView.show();
        });

        
        // Smooth scene transition
        const loader = document.getElementsByClassName('app')[0]
        this.cameras.main.alpha = 0
        this.tweens.add({
            targets: this.cameras.main,
            ease: 'Linear',
            alpha: 1,
            duration: 500,
            delay: 0,
            repeat: 0,
            onComplete: () => {
                this._createCards()
            },
            onUpdate: (tween) => {
                loader.style.opacity = 1 - tween.progress
            }
        });
    }

    _showNameForm() {
        let { width: gameWidth, height: gameHeight } = this.sys.game.canvas;

        var element = this.add.dom(gameWidth/2, gameHeight/2).createFromCache('nameform');
        element.scale = 3
        element.setPosition(gameWidth/2, gameHeight + element.height * 3)
        element.addListener('click');

        element.on('click', function (event) {
    
            if (event.target.name === 'saveRecord')
            {
                var inputUsername = this.getChildByName('username');
                let playerName = inputUsername.value
    
                //  Have they entered anything?
                if (playerName !== '') {
                    //  Turn off the click events
                    this.removeListener('click');

                    var records = localStorage.getItem("records")
                    try {
                        records = JSON.parse(records) || new Map()
                    } catch (error) {
                        records = new Map()
                    }
                    records[playerName] = this.scene._model.moves
        
                    localStorage.setItem("records", JSON.stringify(records))
                    this.scene._recordsView.show()
    
                    this.scene.tweens.add({
                        targets: element,
                        y: gameHeight + element.height * 3,
                        duration: 100,
                        ease: 'Power3'
                    });
                }
                else
                {
                }
            }
    
        });

        this.tweens.add({
            targets: element,
            y: gameHeight/2,
            duration: 100,
            ease: 'Power3'
        });
    }

    _createCards() {
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

        this._model.restart()
    }

    update() {
        for(var i = 0; i < this._cardViews.length; i++) {
            this._cardViews[i].update();
        }
    }
}