import Phaser from "phaser";
import { MainScene } from "../scene";

export class RecordsView extends Phaser.GameObjects.Container {
    constructor(scene: MainScene) {
        super(scene);
        this.scene.add.existing(this);
        this.scene = scene;

        let { width: gameWidth, height: gameHeight } = scene.sys.game.canvas;

        this.setSize(gameWidth * 0.8, gameHeight * 0.8)
        this.setInteractive()

        this.x = gameWidth * 0.5
        this.y = gameHeight * 0.5

        this.scale = 0
        this.active = 0
        this._textStyle = { fontFamily: 'Arial', fontSize: 64, color: '#000000' }

        this.on('pointerdown', (pointer) => {
            this.hide()
        })
    }

    show() {
        var records = {}

        try {
            var recordsString = localStorage.getItem("records");
            records = JSON.parse(recordsString) || {}
        } catch (error) {
        }

        // sort by value
        records = Object.entries(records)
            .sort(([,a],[,b]) => a-b)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        this.removeAll(true)

        var rect = this.scene.add.rectangle(0, 0, this.width, this.height, 0xcccccc);
        this.add(rect)

        if (Object.keys(records).length == 0) {
            this.add(this.scene.add.text(0, 0, "No records", this._textStyle).setOrigin(0.5, 0.5));
        } else {
            this.add(this.scene.add.text(0, -this.height/2 + 100, "Records", this._textStyle).setOrigin(0.5, 0.5));
            let keyX = -this.width/2 + 100
            let valueX = this.width/2 - 100
            let firstRowY = -this.height/2 + 200

            Object.keys(records).forEach ((key, index) => {
                let value = records[key]
                this.add(this.scene.add.text(keyX, firstRowY + 90 * index, key, this._textStyle))
                this.add(this.scene.add.text(valueX, firstRowY + 90 * index, value + " moves", this._textStyle).setOrigin(1, 0))
            })
        }

        this.active = 1
        this.depth = 1000
        this.scene.children.bringToTop(this)

        this.scene.tweens.add({
            targets: this,
            ease: 'Linear',
            scale: 1,
            duration: 100,
            delay: 0,
            repeat: 0
        })
    }

    hide() {
        this.active = 0

        this.scene.tweens.add({
            targets: this,
            ease: 'Linear',
            scale: 0,
            duration: 100,
            delay: 0,
            repeat: 0
        })
    }
}