<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<script type="text/javascript">
			window.method = "<?= $_SERVER['QUERY_STRING'] ?>";
		</script>
		<script type="text/javascript" src="js.php"></script>
		<title>Canvas Examples</title>
		<style type="text/css">
			canvas.main {
				margin : 50px;
			}
		</style>
	</head>
	<body>
		<div style="display:none" id="cachedInput">
			Cached: <input type="checkbox" checked="checked"/>
		</div>
		<canvas width="240" height="150" class="main"></canvas>
		<ul>
			<li><a href="?draggable">Draggable</a></li>
			<li><a href="?droppable">Droppable</a></li>
			<li><a href="?linkable">Linkable</a></li>
			<li><a href="?moveable">Moveable</a></li>
			<li><a href="?de">Desktop Environment</a></li>
			<li><a href="?cachedImage">Cached image draw</a></li>
		</ul>
	</body>
</html>

