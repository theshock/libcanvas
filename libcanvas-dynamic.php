<?php

require dirname(__FILE__) . '/builder.php';

header('Content-type: application/x-javascript');
$builder = new LibCanvasBuilder();
echo $builder->getResult();


