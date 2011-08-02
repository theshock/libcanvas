LibCanvas.Behaviors.Moveable
============================

Поведение `LibCanvas.Behaviors.Moveable` позволяет объекту принимать команды о перемещении в определенную
точку — как мгновенно, так и с анимацией.

## Global

При использовании LibCanvas.extract() можно использовать короткий алиас «Moveable»

## Метод moveTo

    LibCanvas.Behaviors.Animatable moveTo(LibCanvas.Core.Point point, number speed, string fn)

Перемещает объект в точку `point` со скоростью `speed` (пикселов/сек.). При вызове прерывает уже идущую
анимацию и начинает новую.

Если аргумент `speed` не был передан, то объект перемещается в указанную точку мгновенно.

#### Аргумент `fn`

Функция прогресса анимации. По умолчанию используется `linear`.

См. `LibCanvas.Behaviors.Animatable`

#### Возвращает `this`

## Метод stopMoving

Останавливает текущую анимацию перемещения.

#### Возвращает `this`

## Пример

Объект, который перемещается в точку клика мышью:

    var MoveableObject = atom.Class({
        Implements : [LibCanvas.Behaviors.Moveable],

        initialize : function () {
            this.listenMouse()
                .addEvent('away:mousedown', function (event) {
                    this.moveTo(event.offset, 1000, 'sine');
                });
        },
    });

## События

* `stopMove` срабатывает при остановке объекта (в любом случае — то есть, и когда он достиг конечной точки,
  и когда он был остановлен принудительно).

* `move` вызывается каждый раз при анимированном движении объекта.
