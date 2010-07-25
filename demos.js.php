<?php
	$s = microtime(1);
	header('Content-Type:application/x-javascript');
	$files = array_merge (
		glob('./demos-js/*.js'),
		glob('./demos-js/isometric/*.js'),
		glob('./demos-js/making-interface/*.js'),
		glob('./demos-js/making-interface/path-builder/*.js'),
		glob('./demos-js/making-interface/path-builder/sub/*.js'),
		glob('./demos-js/solar-system/*.js'),
		glob('./demos-js/solitaire/*.js'),
		glob('./demos-js/apps/*.js')
	);
	foreach ($files as $js) {
		echo file_get_contents($js), "\n\n";
	}
	echo '//', microtime(1) - $s;