LibCanvas.Behaviors.Linkable
============================

`LibCanvas.Behaviors.Linkable` позволяет связывать между собой два (или более) объекта.
Если связываемый объект содержит поведение `Moveable`, то он будет перемещаться вместе
со связывающим.

Данное поведение будет особенно полезно для создания пользовательского интерфейса - например,
чтобы при перемещении окна перемещалось также все его содержимое.

## Global

При использовании LibCanvas.extract() можно использовать короткий алиас «Linkable»

## Метод link

    LibCanvas.Linkable link(obj)

Связывает объект `obj` с текущим объектом.

## Метод unlink

    LibCanvas.Linkable unlink(obj)

Удаляет связь между текущим объектом и объектом `obj`.

#### Возвращает `this`

## Пример

Допустим, вы пишете игру «Косынка», где необходима возможность перетаскивать группу карт. В данном
случае будет разумно использовать Linkable:

    var Card = atom.Class({
        Implements : [LibCanvas.Behaviors.Draggable,
                      LibCanvas.Behaviors.Droppable,
                      LibCanvas.Behaviors.Linkable]

        initialize : function (rank, parentCard) {
            this.rank = rank;

            if (parentCard) {
                parentCard.link(this);
            }
        },
    });

    // Создаем первую карту в стэке - короля пик
    var firstCard = new Card([Cards.King, Cards.Spades]);

    // Создаем вторую карту - даму червы, и привязываем ее к королю
    var secondCard = new Card([Cards.Queen, Cards.Hearts], firstCard);

    // Теперь при перемещении короля пик также будет перемещаться и дама червы,
    // но при перемещении дамы червы король будет оставаться на месте.
