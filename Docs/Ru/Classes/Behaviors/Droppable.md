LibCanvas.Behaviors.Droppable
=============================

`LibCanvas.Behaviors.Droppable` расширяет `LibCanvas.Behaviors.Draggable`, добавляя возможность взаимодействия
между перетаскиваемым объектом и принимающими объектами, на которые он «сбрасывается» — что позволяет полноценно
реализовать паттерн drag'n'drop.

В класс, в который подмешивается поведение `Droppable` также обязательно должно быть подмешено
поведение `Draggable`.

## Global

При использовании LibCanvas.extract() можно использовать короткий алиас «Droppable»

## Метод drop

    LibCanvas.Behaviors.Droppable drop(object obj);

Добавляет принимающий объект `obj`.

#### Возвращает `this`

#### Пример

В качестве примера мы реализуем отношение файл-корзина - файл можно «выбросить» в корзину, а корзина
содержит все «выброшенные» файлы.

    var recycleBin = new RecycleBin();
    // Реализация класса корзины опущена для краткости

    var File = atom.Class({
        Implements : [LibCanvas.Behaviors.Draggable, LibCanvas.Behaviors.Droppable],

        initialize : function () {
            this.draggable()
                .drop(recycleBin)
                .addEvent('dropped', this.addFileToRecycle);
        },

        addFileToRecycle : function (recycleBin) {
            recycleBin.addFile(this);
        }
    });

## Метод undrop

    LibCanvas.Behaviors.Droppable drop(object obj);

Убирает объект `obj` из списка принимающих объектов.

#### Возвращает `this`

## События

* `dropped` срабатывает при любом «сбрасывании» объекта. В обработчик события передается аргумент, содержащий
  все принимающие объекты, над которыми находится курсор мыши. Если объект находится вне границ принимающих
  объектов — то передается null.

  В примере корзины и файла принимающим объектом будет корзина. Если файл находится вне корзины - передается null,
  если внутри - то передается объект корзины.
