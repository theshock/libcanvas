<?php
	$s = microtime(1);
	header('Content-Type:application/x-javascript');
	$files = array_merge (
		glob('./js/Libs/*.js'),
		glob('./js/Libs/LibCanvas/*.js'),
		glob('./js/Libs/LibCanvas/Interfaces/*.js'),
		glob('./js/Libs/LibCanvas/Inner/Canvas2D/*.js'),
		glob('./js/Libs/LibCanvas/Processors/*.js'),
		glob('./js/Libs/LibCanvas/Inner/*.js'),
		glob('./js/Libs/LibCanvas/Core/*.js'),
		glob('./js/Libs/LibCanvas/Utils/*.js'),
		glob('./js/Libs/LibCanvas/Shapes/*.js'),

		glob('./js/App/*.js'),

		glob('./js/*.js')
	);
	foreach ($files as $js) {
		echo file_get_contents($js), "\n\n";
	}
	echo '//', microtime(1) - $s;