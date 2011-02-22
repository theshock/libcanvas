Point
=====

`LibCanvas.Point` - один из базисов в библиотеке LibCanvas. На нем строятся многие вычисления, простые фигуры, отрисовка результата.

#### Гибкость

Хотя часто в документации будет написано, что требуется объект <code>LibCanvas.Point</code> бывает достаточно передать объект <code>{ x : x, y : y }</code>.

Тем не менее надо быть предельно осторожным с этим. Мы будем ставить тильду: `~` в интерфейсе метода, где можно так сделать

#### Global

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


## Метод `move`

	LibCanvas.Point move(~LibCanvas.Point distance, boolean reverse = false)

В данном случае можно использовать в качестве distance не только LibCanvas.Point, но и обычный объект со свойствами x и y или массив из двух элементов-чисел

#### Пример
	var point = new LibCanvas.Point(10, 10);
	var distance = { x : 5, y : -3 };
	point.move(distance, false); // x : 15, y :  7
	point.move(distance, true ); // x :  5, y : 13

#### События
	point.addEvent('move', function (distance) {
		alert('Точка передвинулась на '
			+ distance.x + ' по оси X и на '
			+ distance.y + ' по оси Y'
		);
	});

#### Возвращает
	this


## Метод `moveTo`

	LibCanvas.Point moveTo(~LibCanvas.Point point, int speed = 0)

`speed` - это количество пикселей, которое точка проходит за секунду. Если задана - будет анимированное движение точки.

#### Пример
	// Растояние между точками где-то 1000 пикселей.
	var start  = new LibCanvas.Point(100, 100);
	var finish = new LibCanvas.Point(800, 800);
	// просто перемещаем точку в конец
	start.moveTo(finish);
	// точка переместится в конец примерно за 2 секунды
	start.moveTo(finish, 500);

#### Возвращает
	this
