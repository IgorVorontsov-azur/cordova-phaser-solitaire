import Phaser from "phaser";
import { MainScene } from "../scene";

export class RecordsView extends Phaser.GameObjects.Container {
    constructor(scene: MainScene) {
        super(scene);
        this.scene.add.existing(this);
        this.scene = scene;
    }

    show() {
        var records = localStorage.getItem("records");
        if (records == null) {
            alert("No records");
        } else {
            alert(records);
        }
    }
}