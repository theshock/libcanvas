<?php

require dirname(__FILE__) . '/../Packager/packager.php';

class LibCanvasBuilder
{
	const NAME = 'LibCanvas';
	const SRC  = '/../Source';
	private $_files = array();
	private $_result;
	private $_packager;

	public function __construct($components = array())
	{
		$pkgDir = dirname(__FILE__) . self::SRC;
		$this->_packager = new Packager($pkgDir);
		if (empty($components)) {
			$files = $this->_packager->get_all_files();
		} else {
			$files = $this->_packager->components_to_files($components);
		}
		$this->_files = $this->_packager->complete_files($files);
		$this->_result = $this->_packager->build($this->_files);
	}

	public function getResult()
	{
		return $this->_result;
	}

	public function getProcessedFiles()
	{
		return $this->_files;
	}
}
