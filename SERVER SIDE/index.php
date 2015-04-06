<?php 
	// Function for basic field validation (present && neither empty nor only white space
	function IsNullOrEmptyString($question){
		return (!isset($question) || trim($question)=='');
	}

	define('DB_HOST', getenv('OPENSHIFT_MYSQL_DB_HOST'));
	define('DB_PORT', getenv('OPENSHIFT_MYSQL_DB_PORT'));
	define('DB_USER', getenv('OPENSHIFT_MYSQL_DB_USERNAME'));
	define('DB_PASS', getenv('OPENSHIFT_MYSQL_DB_PASSWORD'));
	define('DB_NAME', getenv('OPENSHIFT_GEAR_NAME'));

	$dbhost = constant("DB_HOST"); // Host name 
	$dbport = constant("DB_PORT"); // Host port
	$dbusername = constant("DB_USER"); // Mysql username 
	$dbpassword = constant("DB_PASS"); // Mysql password 
	$db_name = constant("DB_NAME"); // Database name 
	
	// Create connection
	$mysqlCon = mysqli_connect($dbhost, $dbusername, $dbpassword, "", $dbport);
	
	// Check connection
	if (!$mysqlCon) {
		 header('HTTP/1.1 500 Internal Server Error');
		 echo "Connection failed: " . mysqli_error();
		 die();
	}
	
	// switch to correct database
	if (!mysqli_select_db($mysqlCon, $db_name)) {
		header('HTTP/1.1 500 Internal Server Error');
		echo "Error: " . mysqli_error();
		mysqli_close($mysqlCon);
		die();
	}
	
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		// GET
		// expects a username
		$error = "";
		$username = "";
		if (isset($_GET["username"]) && !empty($_GET["username"])) {
			$username = $_GET["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (empty($error)) {
			// request is good!
			// call stored proc on server
			$query = "SELECT Term, Color, Enabled " .
					"FROM Terms " .
					"INNER JOIN Users ON " .
					"  Users.UserID = Terms.UserID " .
					"WHERE Users.Username = '$username'";
			if (!($loop = mysqli_query($mysqlCon, $query))) {
				header('HTTP/1.1 500 Internal Server Error');
				echo "Error: " . mysqli_error();
				mysqli_close($mysqlCon);
				die();
			}
			header('HTTP/1.1 200 Ok');
			while ($row = mysqli_fetch_array($loop))
			{
				 echo $row['Term'] . " " . $row['Color'] . " " . $row['Enabled'] . "<br/>";
			}
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		// POST
		// for posting we expect the following
		// username, term, color, enabled
		$error = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["term"]) && !empty($_POST["term"])) {
			$term = $_POST["term"];
		} else {
			$error = "Term is invalid or not set";
		}
		
		if (isset($_POST["color"]) && !empty($_POST["color"])) {
			$color = $_POST["color"];
		} else {
			$error = "Color is invalid or not set";
		}
		
		if (isset($_POST["enabled"]) && !empty($_POST["enabled"])) {
			if ($_POST["enabled"]) {
				$enabled = 1;
			} else {
				$enabled = 0;
			}
		} else {
			$error = "Enabled is invalid or not set (".$_POST["enabled"].")";
		}
	
		
		if (empty($error)) {
			// request is good!
			// call stored proc on server
			$query = "CALL usp_insertTerm('" . $username . "', '" . $term . "', '" . $color . "', " . $enabled . ")";
			if (mysqli_query($mysqlCon, $query)) {
				// Success!
				header('HTTP/1.1 200 Ok');
				echo "Success";
			} else {
				// Failure?
				mysqli_close($mysqlCon);
				header('HTTP/1.1 500 Internal Server Error');
				echo "Query failed";
				die();
			}
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
		// DELETE
		// expects a username
		$error = "";
		$username = "";
		$term = "";
		if (isset($_DELETE["username"]) && !empty($_DELETE["username"])) {
			$username = $_DELETE["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_DELETE["term"]) && !empty($_DELETE["term"])) {
			$term = $_DELETE["term"];
		} else {
			$error = "Term is invalid or not set";
		}
		
		if (empty($error)) {
			// request is good!
			// call stored proc on server
			$query = "CALL usp_deleteTerm('" . $username . "', '" . $term . "')";
			if (mysqli_query($mysqlCon, $query)) {
				// Query Success!
				header('HTTP/1.1 200 Ok');
				echo "Success";
			} else {
				// Query Failure?
				mysqli_close($mysqlCon);
				header('HTTP/1.1 500 Internal Server Error');
				echo "Query failed";
				die();
			}
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else {
		// Unknown request
		header('HTTP/1.1 400 Bad Request');
		echo "Error: Unknown Request " . $_SERVER['REQUEST_METHOD'];
		mysqli_close($mysqlCon);
		die();
	}

	// exit successfully
	mysqli_close($mysqlCon);
?>