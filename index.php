<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<script type="text/javascript">
			window.method = "<?= isset($_REQUEST['action']) ? $_REQUEST['action'] : '' ?>";
			window.arg    = "<?= isset($_REQUEST['arg']) ? $_REQUEST['arg'] : '' ?>";
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
		<canvas width="960" height="600" class="main"></canvas>
		<ul>
			<li><a href="?action=draggable">Draggable</a></li>
			<li><a href="?action=droppable">Droppable</a></li>
			<li><a href="?action=linkable">Linkable</a></li>
			<li><a href="?action=moveable">Moveable</a></li>
			<li><a href="?action=de">Desktop Environment</a></li>
			<li><a href="?action=cachedImage">Cached image draw</a></li>
			<li><a href="?action=pathDrawer">Path drawer</a></li>
			<li><a href="?action=pathBuilder">Path builder</a></li>
		</ul>
	</body>
	<script type="text/javascript">

		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-17446734-1']);
		_gaq.push(['_setDomainName', '.freecr.ru']);
		_gaq.push(['_trackPageview']);

		(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();

	</script>
</html>

