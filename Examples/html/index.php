<?php
$get = function ($name, $default = null) {
	return isset($_GET[$name]) ? $_GET[$name] : $default;
};

$app = $get('app', '');
$arg = $get('arg', '');
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>LibCanvas</title>
		<link href="/styles.css" rel="stylesheet" />
		<script src="/js/atom.js"></script>
		<script src="/js/libcanvas.js"></script>
		<script src="/js/libcanvas-examples.js"></script>
	</head>
	<body>
		<form>
			<label for="app">App: <input id="app" value="<?= $app ?>" /></label>
			<label for="arg">Arg: <input id="arg" value="<?= $arg ?>" /></label>
			<input type="submit" />
		</form>
		<canvas data-app="<?= $app ?>" data-arg="<?= $arg ?>"></canvas>
	</body>
</html>