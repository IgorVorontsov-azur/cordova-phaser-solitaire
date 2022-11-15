import { StackView } from "./StackView";


export class OpenStackView extends StackView {
    _maxCardsCount: integer;

    constructor(...args) {
        super(...args);

        this._maxCardsCount = 1;
    }

    set maxCardsCount(value: integer) {
        this._maxCardsCount = value;
    }

    getCardYOffset(order: integer) {
        return 0;
    }

    // order: 0..cards.length - 1
    getCardXOffset(order: integer) {
        if (this._model.cards.length <= 3) {
            return this._cardXOffset * order
        }

        var inverseOrder = this._model.cards.length - order - 1;
        var newOrder = (this._maxCardsCount - 1) - inverseOrder;
        newOrder = Math.max(0, newOrder);

        return this._cardXOffset * newOrder;
    }
}
