<?php
if (isset($_POST['arg'])) {
	$shape = $_POST['arg'];

	// Saving shape
	$hash = md5($shape);
	if (!file_exists('data/' . $hash)) {
		file_put_contents('data/' . $hash . '.txt', strip_tags($shape));
	} else {
		$shape = file_get_contents('data/' . $hash . '.txt');
	}
}
if (isset($_GET['hash'])) {
	$hash = str_replace('.', '\\.', $_GET['hash']);
	if (file_exists('data/' . $hash . '.txt')) {
		$shape = file_get_contents('data/' . $hash . '.txt');
	} else {
		exit('Shape not found');
	}
}
?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<script type="text/javascript">
			window.method = "pathBuilder";
			window.arg    = "<?= $shape ?>";
		</script>
		<script type="text/javascript" src="js.php"></script>
		<title>Path Builder</title>
		<style type="text/css">
			canvas.main {
				margin : 50px;
			}
		</style>
	</head>
	<body>
		<div style="clear:both;">
			<a href="http://freecr.ru/libcanvas/builder.php?hash=<?= $hash ?>">http://freecr.ru/libcanvas/builder.php?hash=<?= $hash ?></a>
		</div>
		<canvas width="960" height="600" class="main"></canvas>
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
 