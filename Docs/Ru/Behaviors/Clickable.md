Clickable
=========

`LibCanvas.Behaviors.Clickable` добавляет к объекту два состояния - `hover` и `active`.
Первое определяет - наведен ли курсор мыши на объект, последнее - нажата ли при этом левая кнопка.

Для активации поведения необходимо вызвать метод `clickable()`.

## Global

При использовании LibCanvas.extract() можно использовать как короткий алиас «Clickable»

## Метод clickable

Метод добавляет обработчики событий `mouseover`, `mouseout`, `mousedown` и `mouseup`, которые изменяют свойства объекта `hover` и `active` типа boolean.
То есть, при событии `mouseover` `hover` устанавливается в `true`, при `mouseout` — соответственно, в `false`. Аналогично с `mousedown` и `mouseup`,
изменяющими свойство `active`.

### Возвращает `this`

## Пример использования Clickable

Для примера создадим класс кнопки, которая будет менять свой цвет при наведении на нее курсора мыши и унаследуем ее от
базового абстрактного класса кнопки `MyUI.Button`.

    var HoverableButton = atom.Class({
        Extends : MyUI.Button,
        Implements : [LibCanvas.Behaviors.Clickable],

        initialize : function () {
            this.clickable();
        },

        draw : function () {
            // По умолчанию цвет кнопки - красный
            var color = '#FF0000';

            if (this.hover) {
                // Если курсор мыши наведен на кнопку - меняем цвет на зеленый
                color = '#00FF00';
            }

            this.parent(color); // Вызываем родительский метод отрисовки
        }
    });
