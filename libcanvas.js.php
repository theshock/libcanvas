<?php
	$s = microtime(1);
	header('Content-Type:application/x-javascript');
	$files = array_merge (
		glob('./source/*.js'),
		glob('./source/LibCanvas/*.js'),
		glob('./source/LibCanvas/Interfaces/*.js'),
		glob('./source/LibCanvas/Inner/Canvas2D/*.js'),
		glob('./source/LibCanvas/Processors/*.js'),
		glob('./source/LibCanvas/Engines/*.js'),
		glob('./source/LibCanvas/Inner/*.js'),
		glob('./source/LibCanvas/Core/*.js'),
		glob('./source/LibCanvas/Utils/*.js'),
		glob('./source/LibCanvas/Shapes/*.js')
	);
	foreach ($files as $js) {
		echo file_get_contents($js), "\n\n";
	}
	echo '//', microtime(1) - $s;