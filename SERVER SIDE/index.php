<?php 
	/* Justin Robb
	 * 4/20/15
	 * bestClipOfTheWeek
	 * Service to communicate between front-end (javascript ajax calls) and back-end (MySQL db)
	 * Uses mysqli to communicate with back-end
	 */
	
	
	/*
	 * Functionality:
	 *      POST
	 *			- add a term
	 *			- update a term
	 *			- delete a term
	 *		Get
	 *			- retrieves all the terms for the given user
	 *			- sign up a new user
	 *			- login an existing user
	 *			- authorize a user (check login creds)
	 */
	
	
	// CONSTANTS
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
	$php_version = constant(phpversion()); // Version
	
	
	// VARIABLES
	$ip_address = get_ip(); // IP Address of requester
	$salt= "735876902552b2f88b828a0.11736783"; // randomly generated
	
	// enable cross-domain calling (for chrome)
	header('Access-Control-Allow-Origin: *');
	
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
	
	// Handle requests
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		if (isset($_GET["file"]) && !empty($_GET["file"])) {
			$filename = $_GET["file"];
			$attachment_location = $_SERVER["DOCUMENT_ROOT"] . $filename;
			if (file_exists($attachment_location)) {
				header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
				header("Cache-Control: public"); // needed for i.e.
				header("Content-Type: image/png");
				header("Content-Length:".filesize($attachment_location));
				header("Content-Disposition: attachment; filename=" . $filename);
				readfile($attachment_location);
				die();
			} else {
				header('HTTP/1.1 404 Not Found');
				echo "Error: File " . $filename . " not found.";
			}
		} else if (isset($_GET["signup"]) && !empty($_GET["signup"])) {
			// GET Signup
			// Adds a new user to the back-end and logs them in, returns the session token
			// expect username, password
			if (isset($_GET["username"]) && !empty($_GET["username"])) {
				$username = $_GET["username"];
			} else {
				$error = "Username is invalid or not set";
			}
			
			if (isset($_GET["password"]) && !empty($_GET["password"])) {
				$password = $_GET["password"];
			} else {
				$error = "Password is invalid or not set";
			}
			
			if (!empty($error)) {
				// request error
				header('HTTP/1.1 400 Bad Request');
				echo "Error: " . $error;
				die();
			}
			
			$options=['salt'=>$salt, 'cost'=>12];
			$pwdhash = "";
			if ($php_version > 5.5) {
				$pwdhash=password_hash($password, PASSWORD_DEFAULT, $options);  // PHP 5.5+
			} else {
				$pwdhash=crypt($password,'$2y$12$'.$salt.'$'); // PHP 5.4 style
			}
			
			
			$query = "SELECT fn_signUp('$username', '$pwdhash', '$ip_address') AS ret";
			$loop = mysqli_query($mysqlCon, $query);
			$ret = NULL;
			while ($row = mysqli_fetch_array($loop))
			{
				 $ret = $row['ret'];
			}
			
			if ($ret === NULL){
				// failure
				header('HTTP/1.1 501 Internal Server Error');
				echo "Sign up failed";
				mysqli_close($mysqlCon);
				die();
			}
			
			// check if failed for another reason
			if (strpos($ret,'FAILURE___') !== false) {
				$pos = strpos($ret, "FAILURE___") + strlen("FAILURE___");
				header('HTTP/1.1 502 Internal Server Error');
				echo "Sign up failed. " . substr($ret, $pos);
				mysqli_close($mysqlCon);
				die();
			}
			
			header('HTTP/1.1 200 Ok');
			echo $ret;
			
		} else if (isset($_GET["changepassword"]) && !empty($_GET["changepassword"])) {
			// GET changepassword
			// Changes the password for the user
			// expect username, password (old), token, password (new)
			if (isset($_GET["username"]) && !empty($_GET["username"])) {
				$username = $_GET["username"];
			} else {
				$error = "Username is invalid or not set";
			}
			
			if (isset($_GET["password"]) && !empty($_GET["password"])) {
				$password = $_GET["password"];
			} else {
				$error = "Password is invalid or not set";
			}
			
			if (isset($_GET["token"]) && !empty($_GET["token"])) {
				$token = $_GET["token"];
			} else {
				$error = "Token is invalid or not set";
			}
			
			if (isset($_GET["passwordNew"]) && !empty($_GET["passwordNew"])) {
				$passwordNew = $_GET["passwordNew"];
			} else {
				$error = "New password is invalid or not set";
			}
			
			if (!empty($error)) {
				// request error
				header('HTTP/1.1 400 Bad Request');
				echo "Error: " . $error;
				die();
			}
			
			userAuthorize($username, $token, $ip_address, $mysqlCon);
			
			$options=['salt'=>$salt, 'cost'=>12];
			$pwdhash = "";
			if ($php_version > 5.5) {
				$pwdhash=password_hash($password, PASSWORD_DEFAULT, $options);  // PHP 5.5+
				$pwdhashNew=password_hash($passwordNew, PASSWORD_DEFAULT, $options);  // PHP 5.5+
			} else {
				$pwdhash=crypt($password,'$2y$12$'.$salt.'$'); // PHP 5.4 style
				$pwdhashNew=crypt($passwordNew,'$2y$12$'.$salt.'$'); // PHP 5.4 style
			}
			
			
			$query = "SELECT fn_change_password('$username', '$token', '$pwdhash', '$pwdhashNew', '$ip_address') AS ret";
			$loop = mysqli_query($mysqlCon, $query);
			$ret = NULL;
			while ($row = mysqli_fetch_array($loop))
			{
				 $ret = $row['ret'];
			}
			
			if ($ret === NULL){
				// failure
				header('HTTP/1.1 501 Internal Server Error');
				echo "Password change failed";
				mysqli_close($mysqlCon);
				die();
			}
			
			header('HTTP/1.1 200 Ok');
			echo $ret;
		} else if (isset($_GET["login"]) && !empty($_GET["login"])) {
			// GET Login
			// logs the user in and returns the session token
			// expect username, password
			if (isset($_GET["username"]) && !empty($_GET["username"])) {
				$username = $_GET["username"];
			} else {
				$error = "Username is invalid or not set";
			}
			
			if (isset($_GET["password"]) && !empty($_GET["password"])) {
				$password = $_GET["password"];
			} else {
				$error = "Password is invalid or not set";
			}
			
			if (!empty($error)) {
				// request error
				header('HTTP/1.1 400 Bad Request');
				echo "Error: " . $error;
				die();
			}
			
			// to compare the passwords, we must first retireve the stored hashed password from the back-end
			$query = "SELECT fn_checkToken('$username') AS ret";
			$loop = mysqli_query($mysqlCon, $query);
			$hash = NULL;
			while ($row = mysqli_fetch_array($loop))
			{
				 $hash = $row['ret'];
			}
			
			if ($hash === NULL){
				// forbidden
				header('HTTP/1.1 403 Forbidden');
				echo "Incorrect username";
				mysqli_close($mysqlCon);
				die();
			} 
			
			$options=['salt'=>$salt, 'cost'=>12];		
			$pwdhash = "";
			$match = false;
			if ($php_version > 5.5) {
				$pwdhash=password_hash($password, PASSWORD_DEFAULT, $options);  // PHP 5.5+
				$match = password_verify($pwdhash, $hash);
			} else {
				$pwdhash=crypt($password,'$2y$12$'.$salt.'$'); // PHP 5.4 style
				if ($pwdhash == $hash) {
					$match = true;
				}
			}
			
			if ($match) {
				// passwords match!
				$query = "SELECT bestclipoftheweek.fn_login('$username', '$hash', '$ip_address') AS ret";
				$error = "";
				if (!($loop = mysqli_query($mysqlCon, $query))) {
					$error = "Internal Error";
				}
				if (!($row = mysqli_fetch_array($loop))) {
					$error = "Internal Error";
				}
				
				if (!empty($error)) {
					header('HTTP/1.1 500 Internal Server Error');
					echo "Error: " . mysqli_error();
					mysqli_close($mysqlCon);
					die();
				}

				$token = $row['ret'];
				header('HTTP/1.1 200 Ok');
				echo $token;
			} else {
				header('HTTP/1.1 403 Forbidden');
				echo "Incorrect password";
				mysqli_close($mysqlCon);
				die();
			}
		} else if (isset($_GET["authorize"]) && !empty($_GET["authorize"])){
			// GET authorize
			// checks the login credentials for the user and returns success/failure if they are authorized or not.
			// expect username, token
			if (isset($_GET["username"]) && !empty($_GET["username"])) {
				$username = $_GET["username"];
			} else {
				$error = "Username is invalid or not set";
			}
			
			if (isset($_GET["token"]) && !empty($_GET["token"])) {
				$token = $_GET["token"];
			} else {
				$error = "Token is invalid or not set";
			}
			
			if (!empty($error)) {
				// request error
				header('HTTP/1.1 400 Bad Request');
				echo "Error: " . $error;
				die();
			}
			
			userAuthorize($username, $token, $ip_address, $mysqlCon);
			header('HTTP/1.1 200 Ok');
			echo "OK";
		} else {
			// GET Terms
			// Returns a list of terms for the given user
			// the list will have ";" between the rows and spaces between the columns
			// expects a username token
			$error = "";
			$username = "";
			if (isset($_GET["username"]) && !empty($_GET["username"])) {
				$username = $_GET["username"];
			} else {
				$error = "Username is invalid or not set";
			}
			
			if (isset($_GET["token"]) && !empty($_GET["token"])) {
				$token = $_GET["token"];
			} else {
				$error = "Token is invalid or not set";
			}
			
			userAuthorize($username, $token, $ip_address, $mysqlCon);
			
			if (empty($error)) {
				// request is good!
				// call stored proc on server
				$query = "SELECT Term, Color, Enabled " .
						"FROM Terms " .
						"INNER JOIN Users ON " .
						"  Users.UserID = Terms.UserID " .
						"WHERE Users.Username = '$username'" .
						"ORDER BY Term";
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
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["logout"]) && !empty($_POST["logout"])) {
		// logs the user out
		// expects username, token
		
		$error = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["token"]) && !empty($_POST["token"])) {
			$token = $_POST["token"];
		} else {
			$error = "Token is invalid or not set";
		}
		
		userAuthorize($username, $token, $ip_address, $mysqlCon);
	
		if (empty($error)) {
			// request is good!
			$query = "SELECT bestclipoftheweek.fn_logout('$username', '$token', '$ip_address') AS ret";
			$error = "";
			if (!($loop = mysqli_query($mysqlCon, $query))) {
				$error = "Internal Error";
			}
			if (!($row = mysqli_fetch_array($loop))) {
				$error = "Internal Error";
			}
			
			if (!empty($error)) {
				header('HTTP/1.1 500 Internal Server Error');
				echo "Error: " . mysqli_error();
				mysqli_close($mysqlCon);
				die();
			}

			$resp = $row['ret'];
			header('HTTP/1.1 200 Ok');
			echo $resp;
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["download"]) && !empty($_POST["download"])) {
		// special case to enable downloading of chart png across browsers
		$error = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["token"]) && !empty($_POST["token"])) {
			$token = $_POST["token"];
		} else {
			$error = "Token is invalid or not set";
		}
		
		if (isset($_POST["filename"]) && !empty($_POST["filename"])) {
			$filename = $_POST["filename"];
		} else {
			$error = "File name is invalid or not set";
		}
		
		userAuthorize($username, $token, $ip_address, $mysqlCon);
	
		if (empty($error)) {
			// request is good!
			$EncodedPNG = $_POST["download"];
			//Replace spaces with +
			$EncodedPNG = str_replace(' ','+',$EncodedPNG);
			//Remove identifier string from begining of data.
			$EncodedPNG =  str_replace('data:image/png;base64,', '', $EncodedPNG);
			$decoded=base64_decode($EncodedPNG);	
			$my_file = $filename;
			
			if (!($handle = fopen($my_file, 'w'))) {
				header('HTTP/1.1 500 Internal server error');
				echo "Error: Unable to create file " . $filename;
				die();
			}
			fwrite($handle, $decoded);
			fclose($handle);
			
			header('HTTP/1.1 200 Ok');
			echo $my_file;
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["thumbnail"]) && !empty($_POST["thumbnail"])) {
		// special case to enable downloading of thumnail images across browsers
		$error = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["token"]) && !empty($_POST["token"])) {
			$token = $_POST["token"];
		} else {
			$error = "Token is invalid or not set";
		}
		
		if (isset($_POST["filename"]) && !empty($_POST["filename"])) {
			$filename = $_POST["filename"];
		} else {
			$error = "File name is invalid or not set";
		}
		
		userAuthorize($username, $token, $ip_address, $mysqlCon);
	
		if (empty($error)) {
			// request is good!
			$fileUrl = $_POST["thumbnail"];
			
			if (file_put_contents($filename, file_get_contents($fileUrl), LOCK_EX) > 0) {
				header('HTTP/1.1 200 Ok');
				echo $filename;
			} else {
				header('HTTP/1.1 500 Internal Server Error');
				echo "Error: Unable to create image file.";
				die();
			}
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["method"]) && $_POST["method"] === 'POST') {
		// POST
		// updates or adds the term to the back-end for the given user
		// for posting we expect the following
		// username, term, color, enabled, token
		$error = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["term"]) && !empty($_POST["term"])) {
			$term = $_POST["term"];
			$term  = mysqli_real_escape_string($mysqlCon, $term); //sql escape term
		} else {
			$error = "Term is invalid or not set";
		}
		
		if (isset($_POST["color"]) && !empty($_POST["color"])) {
			$color = $_POST["color"];
		} else {
			$error = "Color is invalid or not set";
		}
		
		if (isset($_POST["enabled"]) && !empty($_POST["enabled"])) { 
			if ($_POST["enabled"] === "yes"){
				$enabled = 1;
			} else {
				$enabled = 0;
			}
		} else {
			$error = "Enabled is invalid or not set (".$_POST["enabled"].")";
		}
		
		if (isset($_POST["token"]) && !empty($_POST["token"])) {
				$token = $_POST["token"];
			} else {
				$error = "Token is invalid or not set";
			}
			
		userAuthorize($username, $token, $ip_address, $mysqlCon);
	
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
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["delete_file"]) && !empty($_POST["delete_file"])) {
		// DELETE
		// removes a file from the server
		// expects a username, token
		$error = "";
		$username = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["token"]) && !empty($_POST["token"])) {
				$token = $_POST["token"];
			} else {
				$error = "Token is invalid or not set";
			}
			
		userAuthorize($username, $token, $ip_address, $mysqlCon);
		
		if (empty($error)) {
			// request is good!
			$filename = $_POST["delete_file"];
			if (unlink($filename)) {
				header('HTTP/1.1 200 Ok');
				echo "Success";
			} else {
				header('HTTP/1.1 500 Internal Server Error');
				echo "Error: unable to delete file.";
				die();
			}
		} else {
			// request error
			header('HTTP/1.1 400 Bad Request');
			echo "Error: " . $error;
			die();
		}
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["method"]) && $_POST["method"] === 'DELETE') {
		// DELETE
		// removes a term from the stored list for the given user
		// expects a username, term, token
		$error = "";
		$username = "";
		$term = "";
		if (isset($_POST["username"]) && !empty($_POST["username"])) {
			$username = $_POST["username"];
		} else {
			$error = "Username is invalid or not set";
		}
		
		if (isset($_POST["term"]) && !empty($_POST["term"])) {
			$term = $_POST["term"];
			$term  = mysqli_real_escape_string($mysqlCon, $term); //sql escape term
		} else {
			$error = "Term is invalid or not set";
		}
		
		if (isset($_POST["token"]) && !empty($_POST["token"])) {
				$token = $_POST["token"];
			} else {
				$error = "Token is invalid or not set";
			}
			
		userAuthorize($username, $token, $ip_address, $mysqlCon);		
		
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
	
	/////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////////////
	
	// Function for basic field validation (present && neither empty nor only white space
	function IsNullOrEmptyString($question){
		return (!isset($question) || trim($question)=='');
	}
	
	/* 
	 * Checks the credentials for the user against the back-end.
	 * Params
	 *		username - name of the user who made the request
	 *		token - session token the user has provided with their request
	 *		ip_address - ip address of requestor
	 *		mysqlCon - the open connection to be used to communicate with back-end (will be closed on failure)
	 *
	 * Only returns if the user is correctly logged in.
	 */
	function userAuthorize($username, $token, $ip_address, $mysqlCon) {
		$query = "SELECT bestclipoftheweek.fn_authorize('$username', '$token', '$ip_address') AS ret";
		$error = "";
		if (!($loop = mysqli_query($mysqlCon, $query))) {
			$error = "Internal Error";
		}
		if (!($row = mysqli_fetch_array($loop))) {
			$error = "Internal Error";
		}
		
		if (!empty($error)) {
			header('HTTP/1.1 500 Internal Server Error');
			echo "Error: " . mysqli_error();
			mysqli_close($mysqlCon);
			die();
		}

		$bit = $row['ret'];
		
		if ($bit)  {
			return;
		}
		header('HTTP/1.1 403 Forbidden');
		echo "Incorrect or expired token";
		mysqli_close($mysqlCon);
		die();
	}
	
	/* 
	 * Sleuths the IP address of the requester.
	 *
	 * Returns the requester's IP address
	 */
	// https://www.chriswiegman.com/2014/05/getting-correct-ip-address-php/
	function get_ip() {
		//Just get the headers if we can or else use the SERVER global
		if ( function_exists( 'apache_request_headers' ) ) {

			$headers = apache_request_headers();

		} else {

			$headers = $_SERVER;

		}

		//Get the forwarded IP if it exists
		if ( array_key_exists( 'X-Forwarded-For', $headers ) && filter_var( $headers['X-Forwarded-For'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {

			$the_ip = $headers['X-Forwarded-For'];

		} elseif ( array_key_exists( 'HTTP_X_FORWARDED_FOR', $headers ) && filter_var( $headers['HTTP_X_FORWARDED_FOR'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 )
		) {

			$the_ip = $headers['HTTP_X_FORWARDED_FOR'];

		} else {
			
			$the_ip = filter_var( $_SERVER['REMOTE_ADDR'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 );

		}

		return $the_ip;
	}
	
	
?>