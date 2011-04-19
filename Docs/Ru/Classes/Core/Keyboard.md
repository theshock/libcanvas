LibCanvas.Keyboard
==================

`LibCanvas.Keyboard` предоставляет интерфейс для прозрачного управления клавиатурой.

#### Примечание

Чтобы посмотреть доступный список кодов клавиш - смотрите раздел `Docs/Additions/KeyCodes`

## Статические свойства:

`keyCodes` - хеш названий клавиш и их кодов, где названия - ключ, а код - значение. Содержит следующие названия и коды:

`codeNames` аналогичен свойству `keyCodes` с той разницей, что ключ - код клавиши, а значение - её название.

## Статические методы

`Keyboard.keyState` - возвращает `true`, если клавиша нажата или `false` если не нажата. Первый параметр - название/числовой код клавиши.

	if (Keyboard.keyState('aup')) {
		unit.move();
	}

`Keyboard.keyName` - возвращает текстовое название клавиши согласно её кода или события.

	alert(Ketboard.keyName(13)); // 'enter'

	atom.dom('body').bind('keydown', function (e) {
		alert(Ketboard.keyName(e)); // 'enter'
	});

## Динамические методы

`keyState` - динамический алиас для `Keyboard.keyState`

	if (libcanvas.keyboard.keyState('aup')) {
		unit.move();
	}

`debug` - выводить на экран список всех нажатых клавиш.

	libcanvas.keyboard.debug(); // debug включен

	libcanvas.keyboard.debug(false); // debug отключен

## События

Можно подписываться на события нажатий клавиш. Добавьте суффикс `:up` или `:press` для уточнения события:

	libcanvas.keyboard.addEvent('enter', function (e) {
		// выполнить когда нажата 'enter
	});

	libcanvas.keyboard.addEvent('enter:up', function (e) {
		// выполнить когда отпущена 'enter
	});