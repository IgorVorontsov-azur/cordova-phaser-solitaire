import Phaser from "phaser";
import { Stack } from "../model";


export class StackView extends Phaser.GameObjects.Container {
    _model: Stack;
    _cardXOffset: integer;
    _cardYOffset: integer;

    constructor(stack: Stack, scene: Phaser.Scene, atlas: string, back: string, cardXOffset: integer = 0, cardYOffset: integer = 0, x: integer = 0, y: integer = 0) {
        super(scene);
        this.scene.add.existing(this);
        this.scene = scene;

        this._model = stack;
        this._cardXOffset = cardXOffset;
        this._cardYOffset = cardYOffset;

        this.back = this.scene.add.image(0, 0, atlas, back);
        this.back.setOrigin(0.5, 0.5);
        this.back.alpha = 0.25;
        this.back.depth = -1;
        this.add(this.back);

        this.setInteractive(new Phaser.Geom.Rectangle(-this.back.width / 2, -this.back.height / 2, this.back.width, this.back.height), Phaser.Geom.Rectangle.Contains);

        this.x = x;
        this.y = y;
    }

    get model() {
        return this._model;
    }

    getCardYOffset(order: integer) {
        return this._cardYOffset * order;
    }

    getCardXOffset(order: integer) {
        return 0;
    }
}
