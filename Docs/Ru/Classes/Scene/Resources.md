LibCanvas.Scene.Resources
=========================

`LibCanvas.Scene.Resources` - регистр со списком ресурсов приложения, таких, как картинки, звуки, ссылка мышь и клавиатуру и т.д.

## Создание
Создаётся автоматически при инициализации приложения `LibCanvas.App`


## Свойства

`mouse` - ссылка на элемент `LibCanvas.Mouse`

`keyboard` - ссылка на элемент `LibCanvas.Keyboard`

## Метод imageExists

	boolean imageExists(string name)

Проверяет, есть ли картинка с названием `name`

## Метод getImage

	Image getImage(string name)

Возвращает картинку с названием `name`

## Метод getAudio

	LibCanvas.Utils.AudioElement getAudio(string name)

Возвращает звуковую дорожку с названием `name`
