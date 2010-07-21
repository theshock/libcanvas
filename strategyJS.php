<?php
	$s = microtime(1);
	header('Content-Type:application/x-javascript');
	$files = array_merge (
		glob('./js/Strategy/*.js')
	);
	foreach ($files as $js) {
		echo file_get_contents($js), "\n\n";
	}
	echo '//', microtime(1) - $s;