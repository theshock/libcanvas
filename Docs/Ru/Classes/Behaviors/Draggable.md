LibCanvas.Behaviors.Draggable
=============================

`LibCanvas.Behaviors.Draggable` добавляет возможность перетскивать объект при помощи мыши.

Объект, в который подмешивается `Draggable` также должен включать `Moveable`, так как первое поведение зависит
от последнего.

Для активации поведения необходимо вызвать метод `draggable()`.

## Global

При использовании LibCanvas.extract() можно использовать короткий алиас «Draggable»

## События

* `startDrag` срабатывает при начале перетаскивания объекта мышью.

* `moveDrag` срабатывает при перемещении объекта. Передается аргумент с координатами перемещаемого объекта относительно
  предыдущих переданных координат.

* `stopDrag` срабатывает при прекращении перетаскивания.

## Свойства

#### dragStart

Содержит исходные координаты (т.е. те, которые были до начала перетаскивания) объекта.

## Метод draggable

Вызов метода добавляет события `startDrag`, `moveDrag`, и `stopDrag`, позволяя перетаскивать объект.

#### Аргумент `stopDrag`

Если передать в качестве аргумента `true`, то у объекта временно отключается возможность его перетаскивать.
Вызов метода с аргументом `false` включает ее обратно.

По умолчанию поведение не изменяется.

#### Возвращает `this`

#### Пример

    var DraggableShape = atom.Class({
        Implements : [LibCanvas.Behaviors.Draggable, LibCanvas.Behaviors.Moveable],

        initialize : function () {
            this.draggable()
                .addEvent('startDrag', this.startDrag) // Контекст вызываемых функций будет верным,
                .addEvent('stopDrag', this.stopDrag);  // т.к. он указывается в addEvent
        },

        startDrag : function () {
            this.opacity = 0.5;
        }
        stopDrag : function () {
            this.opacity = 1.0;
        }
    });
