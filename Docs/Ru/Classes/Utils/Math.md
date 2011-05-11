LibCanvas.Utils.Math
====================

Пасширение, предоставляющее базовые математические операции

## Углы

#### number.degree()

Переводит градусы в радианы. **В переменных всегда должны хранится только радианы**, любые использования градусов - только для удобства чтения человеком:

	var d60 = (60).degree();

#### number.getDegree()

Переводит радианы в градусы. **Рекомендуется к использованию только для дебага**:

	var d60 = (60).degree();

	console.log( d60.getDegree().toFixed(0) ); // 60

#### number.normalizeAngle()

Приводит угол в радианах к углу между 0 и 360 градусами:

	var d60 = (420).degree().normalizeAngle();

	console.log( d60.getDegree().toFixed(0) ); // 60

## Время

#### toSeconds, toMinutes, toHours

Получить секунды, минуты, часы из миллисекунд

	console.log( ( 15000).toSeconds() ) // 15
	console.log( (120000).toMinutes() ) //  2

#### seconds, minutes, hours

Получить миллисекунды из секунд, часов, минут:

	console.log( (55).seconds() ); // 55000
	console.log( ( 1).minutes() ); // 60000

## Геометрия

#### Math.hypotenuse(cathetus1, cathetus2)

Получить гипотенузу из двох катетов по теореме Пифагора:

	Math.hypotenuse(3, 4); // 5

#### Math.cathetus(hypotenuse, cathetus2)

Получить катет из гипотенузы и второго катета по теореме Пифагора:

	Math.cathetus(13, 5); // 12
