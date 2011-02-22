Point
=====

`LibCanvas.Point` - один из базисов в библиотеке LibCanvas. На нем строятся многие вычисления, простые фигуры, отрисовка результата.

#### note

Хотя часто в документации будет написано, что требуется объект <code>LibCanvas.Point</code> бывает достаточно передать объект <code>{ x : x, y : y }</code>.

Тем не менее надо быть предельно осторожным с этим. Мы будем ставить тильду: `~` в интерфейсе метода, где можно так сделать

## Global
При использовании LibCanvas.extract() можно использовать как короткий алиас "Point"

## Создание экземпляра LibCanvas.Point
Создать экземпляр класса `LibCanvas.Point` можно одним из следующих способов:

	var xCoord = 15, yCoord = 20;
	// передав в конструктор координаты
	var point = new LibCanvas.Point( xCoord, yCoord );
	// массив координат
	var point = new LibCanvas.Point([xCoord, yCoord]);
	// объект координат
	var point = new LibCanvas.Point({ x : xCoord, y : yCoord });
	// Другой объект LibCanvas.Point
	var point = new LibCanvas.Point(anotherPoint);
	// что равнозначно с
	var point = anotherPoint.clone();
