## LibCanvas Javascript Framework

*LibCanvas* is a free javascript library, based on [AtomJS framework](/theshock/atomjs) and available under [LGPL License](http://www.gnu.org/copyleft/lgpl.html).

#### [Examples](http://libcanvas.github.com/)

Current objectives of the project:

* Full documentation
* Translation to English

For consultation, write to shocksilien@gmail.com

## Возможности LibCanvas

LibCanvas - библиотека для создания интерактивных приложений и игр на html5. Основные возможности:

* [Расширенный 2d Context](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Context2D.md):
  *  Method chaining
  *  Фигуры в качестве аргументов
  *  Дополнительные методы
  *  Именнованные аргументы


* [Геометрия](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/Shapes)
  *  [Действия с точками](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Point.md)
  *  Изменения фигуры
  *  Пересечения
  *  Базовые математические операции


* Фреймворк LibCanvas.App
  *  Отрисовка только изменившихся частей холста
  *  События мыши
  *  Draggable/Droppable
  *  Слои, внутренний zIndex
  *  Быстрое смещение слоёв


* Игровые движки
  *  Тайловый
  *  [Изометрический](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Isometric/Projection.md)
  *  [Гексагональный](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Hex/Projection.md)


* Дополнительные возможности (плагины)
  *  Спрайтовые анимации
  *  Спрайтовые шрифты
  *  Математическая модель кривых Безье (для построения путей)
  *  Кривые с динамической шириной и цветом
  *  Рендеринг текстуры в проекции

## Переход на новую версию

21 декабря 2012-ого года была публично переведена в "master" главной ветка "declare".

Предыдущая версия всё ещё доступна [в ветке previous](https://github.com/theshock/libcanvas/tree/previous), но больше не разрабатывается.

Основные изменения в новой версии:

* Основательно переписан код, убраны основные баги архитектуры и неочевидные вещи
* Повышена производительность основных компонентов библиотеки
* Более не требуется расширение прототипов. Оно всё ещё поддерживается, но теперь полностью на совести пользователя - библиотека не требует расширенных при помощи atom прототипов
* Используется atom.declare вместо atom.Class в целях повышения производительности и облечения дебага