## LibCanvas Javascript Framework

*LibCanvas* is a free javascript library, based on [AtomJS framework](https://github.com/theshock/atomjs) and available under [LGPL](http://www.gnu.org/copyleft/lgpl.html)/[MIT](http://opensource.org/licenses/mit-license.php) License.

#### [Examples](http://libcanvas.github.com/)

Current objectives of the project:

* Full documentation
* Translation to English

For consultation, write to shocksilien@gmail.com

## Возможности LibCanvas

LibCanvas - библиотека для создания интерактивных приложений и игр на html5. Основные возможности:

* [Расширенный 2D Context](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Context2D.md):
  *  Method chaining
  *  Фигуры в качестве аргументов
  *  Дополнительные методы
  *  Именованные аргументы

* [Геометрия](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/Shapes)
  *  [Действия с точками](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Point.md)
  *  Изменения фигуры
  *  Пересечения
  *  Базовые математические операции


* [Фреймворк LibCanvas.App](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/App)
  *  Отрисовка только изменившихся частей холста
  *  События мыши
  *  Draggable/Droppable
  *  Слои, внутренний zIndex
  *  Быстрое смещение слоёв


* Игровые движки
  *  [Тайловый](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Tile/)
  *  [Изометрический](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Isometric/Projection.md)
  *  [Гексагональный](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Hex/Projection.md)


* Дополнительные возможности (плагины)
  *  [Спрайтовые анимации](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/Plugins/Animation)
  *  [Математическая модель кривых Безье](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Plugins/Curve.md) (для построения путей)
  *  [Кривые с динамической шириной и цветом](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Plugins/Curves.md)
  *  Спрайтовые шрифты
  *  Рендеринг текстуры в проекции

## Интеграция

* [Gem для Ruby on Rails](https://github.com/tanraya/libcanvas-rails)

## Переход на новую версию

21 декабря 2012-ого года была публично переведена в "master" главной ветка "declare".

Предыдущая версия всё ещё доступна [в ветке previous](https://github.com/theshock/libcanvas/tree/previous), но больше не разрабатывается.

Основные изменения в новой версии:

* Основательно переписан код, убраны основные баги архитектуры и неочевидные вещи
* Повышена производительность основных компонентов библиотеки
* Более не требуется расширение прототипов. Оно всё ещё поддерживается, но теперь полностью на совести пользователя - библиотека не требует расширенных при помощи atom прототипов
* Используется atom.declare вместо atom.Class в целях повышения производительности и облечения дебага

