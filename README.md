## LibCanvas Javascript Framework

*LibCanvas* is a free javascript library, based on [AtomJS framework](/theshock/atomjs) and available under [LGPL License](http://www.gnu.org/copyleft/lgpl.html).

#### [Examples](http://libcanvas.github.com/)

Current objectives of the project:

* Full documentation
* Translation to English

For consultation, write to shocksilien@gmail.com

## Переход на новую версию

21 декабря 2012-ого года была публично переведена в "master" главной ветка "declare".

Предыдущая версия всё ещё доступна [в ветке previous](https://github.com/theshock/libcanvas/tree/previous), но больше не разрабатывается.

Основные изменения в новой версии:

* Основательно переписан код, убраны основные баги архитектуры и неочевидные вещи
* Повышена производительность основных компонентов библиотеки
* Более не требуется расширение прототипов. Оно всё ещё поддерживается, но теперь полностью на совести пользователя - библиотека не требует расширенных при помощи atom прототипов
* Используется atom.declare вместо atom.Class в целях повышения производительности и облечения дебага