<?php
require_once 'connection.php'; // подключаем скрипт


// Print JSON from STR
function showJson($reqArr)
{
    $arrLikeJson = [];


    array_push($arrLikeJson, array(
        "user_link" => $link,
        "name"      => $name,
        "height"    => $height,
        "weight"    => $weight,
        "date"      => $date,
        "info"      => $info,
        "country"   => $country
    ));

    echo "Пример функции.\n";
//    return $retval;
}

// Get all records
if (isset($_GET['get'])) {
    if ($_GET['get'] == 'all' && isset($_GET['limit']) == false)
    {
        $link = mysqli_connect($host, $user, $password, $database)
        or die("Ошибка " . mysqli_error($link));


        $query = "SELECT * FROM testtrends";

        $result = mysqli_query($link, $query) or die("Ошибка " . mysqli_error($link));
        if ($result) {
            $rows = mysqli_num_rows($result); // количество полученных строк

            echo '{ "trends":'." \r\n";
            echo "[ \r\n";
//            echo "<table><tr><th>Id</th><th>Title</th><th>Info</th></tr>";
            for ($i = 0; $i < $rows; ++$i) {
                $row = mysqli_fetch_row($result);

                $row1 = iconv("windows-1251","utf-8",$row[1]);
                $row2 = iconv("windows-1251","utf-8",$row[2]);
//                echo "<tr>";
//                for ($j = 0; $j < 3; ++$j) {
//                    $encode = mb_detect_encoding($row[j], array("UTF-8", "Windows-1251", "CP866", "KOI8-R"));
//                    echo "<td style='padding-bottom: 20px;'>$row[$j] $encode</td>";
//                }
//                echo "</tr>";
                echo "{\r\n";
                echo '"id": '.$row[0].",\r\n";
                //echo '"title": '."\"$row[1]\"".",\r\n";
                //echo '"info": '.$row[2]."\r\n";
                echo '"title": '."\"$row1\"".",\r\n";
                echo '"info": '.$row2."\r\n";
                if (($i + 1) < $rows) {
                    echo "}, \r\n";
                } else {
                    echo "} \r\n";
                }
            }
//            echo "</table>";
            echo "] \r\n";
            echo "}";

            // очищаем результат
            mysqli_free_result($result);
        }
    }
    elseif ($_GET['get'] == 'all' && isset($_GET['limit']))
    {
        $reqLimit = (int)$_GET['limit'];
        // Проверкаа на валидность
        if ($reqLimit > 0){
//            echo "1-22 Вы запросили ".$reqLimit." записей, начиная с конца";

            // Коннектимся к БД
            $mysqli = new mysqli($host, $user, $password, $database);
            /* проверяем соединение */
            if (mysqli_connect_errno()) {
                printf("Не удалось подключиться: %s\n", mysqli_connect_error());
                exit();
            }
            $stmt = $mysqli->prepare("SELECT * FROM `testtrends` ORDER BY `id` DESC LIMIT 0,?");
            $stmt->bind_param("i",$reqLimit);
            if (!$stmt->execute()) {
                echo "Не удалось выполнить запрос: (" . $stmt->errno . ") " . $stmt->error;
            }
            $result = $stmt->get_result();
            // Далее - вынести в функцию
            print '{ "trends": ['."\r\n";
            $teller = 0;
            while ($row = $result->fetch_array(MYSQLI_NUM))
            {
                $teller++;
                $trendId = '"id": '.$row[0].",\r\n";
                $trendTitle = '"title": "'.iconv("windows-1251","utf-8", $row[1]).'"'.",\r\n";
                $trendInfo = '"info": '.iconv("windows-1251","utf-8", $row[2])."\r\n";

                print "{"."\r\n";
                print "$trendId";
                print "$trendTitle";
                print "$trendInfo";
                if($result->num_rows !== $teller) {
                    print "},"."\r\n";
                } else {
                    print "}"."\r\n";
                }

            }
            print ']'."\r\n";
            print '}'."\r\n";

            /* закрываем запрос */
            $stmt->close();
            /* закрываем соединение */
            $mysqli->close();

        } else {
            echo "Ошибка. Вы запросили неверное (".$reqLimit.") количество записей, начиная с $reqID";

        }
    }
    else
        {
        echo 'Не правильный гет-запрос';
    }
}


// Get record by ID
if (isset($_GET['id'])) {
//    echo "19-07"."\r\n";
    $reqID = preg_replace('/\s/', '', $_GET['id']);

    if (strlen($reqID) > 0) {
        $reqID = explode(",", $reqID);

        $goodReqIDArr = array(); // Сюда запишем результат;

        // Проверки на валидность каждого отдельного ID в запросе
        foreach ( $reqID as $checkedID) {
            if (strpos($checkedID, '.') !== false) {
                echo 'Не правильный ID в строке запроса: "'.$checkedID.'". Найден лишний символ в строке';
                return false;
            }

            if (!is_numeric($checkedID)) {
                echo 'Не правильный ID в строке запроса: "'.$checkedID.'". Это точно не numeric. Проверьте запрос и попробуйте снова';
                return false;
            } else {
                $checkedID = (integer) $checkedID;
                !in_array($checkedID, $goodReqIDArr) ? array_push($goodReqIDArr, $checkedID) : null; // Если такого ID еще нет, то добавить
            }
        }

        // Коннектимся к БД
        $mysqli = new mysqli($host, $user, $password, $database);
        /* проверяем соединение */
        if (mysqli_connect_errno()) {
            printf("Не удалось подключиться: %s\n", mysqli_connect_error());
            exit();
        }

        //$stmt = mysqli_prepare($link, "INSERT INTO testtrends(title, info) VALUES (?, ?)"); // создание строки запроса
        //mysqli_stmt_bind_param($stmt, 'ss', $codedTitle, $codedInfo); // экранирования символов для mysql


        if(count($goodReqIDArr) == 1)
        {
            $stmt = $mysqli->prepare("SELECT `info` FROM `testtrends` WHERE id=?");
            // info заменить на *
            $stmt->bind_param("i", $goodReqIDArr[0]);
            if (!$stmt->execute()) {
                echo "Не удалось выполнить запрос: (" . $stmt->errno . ") " . $stmt->error;
            }
            $result = $stmt->get_result();

            print '{ "trends": ['."\r\n";
            while ($row = $result->fetch_array(MYSQLI_NUM))
            {
                foreach ($row as $r)
                {
                    $r = iconv("windows-1251","utf-8",$r);
                    print "$r";
                }
                print "\n";
            }
            print ']'."\r\n";
            print '}'."\r\n";
        }
        elseif (count($goodReqIDArr) > 1)
        {

            $clause = implode(',', array_fill(0, count($goodReqIDArr), '?'));
            $stmt = $mysqli->prepare("SELECT * FROM `testtrends` WHERE id IN (" . $clause . ") GROUP BY `id`,`info`");
            $stmt->bind_param(str_repeat('i', count($goodReqIDArr)), ...$goodReqIDArr);
            if (!$stmt->execute()) {
                echo "Не удалось выполнить запрос: (" . $stmt->errno . ") " . $stmt->error;
            }
            $result = $stmt->get_result();
            print '{ "trends": ['."\r\n";
            $teller = 0;
            while ($row = $result->fetch_array(MYSQLI_NUM))
            {
                $teller++;
                $trendId = '"id": '.$row[0].",\r\n";
                $trendTitle = '"title": "'.iconv("windows-1251","utf-8", $row[1]).'"'.",\r\n";
                $trendInfo = '"info": '.iconv("windows-1251","utf-8", $row[2])."\r\n";

                print "{"."\r\n";
                print "$trendId";
                print "$trendTitle";
                print "$trendInfo";
                if($result->num_rows !== $teller) {
                    print "},"."\r\n";
                } else {
                    print "}"."\r\n";
                }

            }
            print ']'."\r\n";
            print '}'."\r\n";
        }

        /* закрываем запрос */
        $stmt->close();
        /* закрываем соединение */
        $mysqli->close();

    }
    else
    {
        echo "Запрошено неправильное количество записей \r\n";
        echo "Ваш запрос: $reqID"."\r\n";
        return false;
    }



//
//    if (is_array($reqID)) {
//        echo 'is_array. Запрошенный ID '."\r\n";
//        print_r($reqID);
//    } else {
//        echo 'Это точно не array'."\r\n";
//    }
//
//    if (is_numeric($reqID)) {
//        echo 'is_numeric. Запрошенный ID '.$reqID."\r\n";
//    } else {
//        echo 'Это точно не numeric'."\r\n";
//    }
//    if (is_int($reqID)) {
//        echo 'is_int. Запрошенный ID '.$reqID."\r\n";
//    } else {
//        echo 'Это точно не int'."\r\n";
//    }
//    if (is_string($reqID)) {
//        echo 'is_string. Запрошенный ID '.$reqID."\r\n";
//    } else {
//        echo 'Это точно не string'."\r\n";
//    }


}


// Add new record form POST
if (count($_POST) != 0) {

    if (isset($_POST['title']) && isset($_POST['info'])) {
        $link = mysqli_connect($host, $user, $password, $database);
        /* проверка подключения */
        if (!$link) {
            printf("Не удалось подключиться: %s\n", mysqli_connect_error());
            exit();
        };

        $codedTitle = iconv("utf-8", "windows-1251", $_POST['title']); // смена кодировки
        $codedInfo = iconv("utf-8", "windows-1251", $_POST['info']);

        $stmt = mysqli_prepare($link, "INSERT INTO testtrends(title, info) VALUES (?, ?)"); // создание строки запроса
        mysqli_stmt_bind_param($stmt, 'ss', $codedTitle, $codedInfo); // экранирования символов для mysql

        if (mysqli_stmt_execute($stmt)) { // выполнение подготовленного запроса
            echo "Данные добавлены";
        } else {
            print_r($stmt->errorInfo());
        }

        mysqli_stmt_close($stmt); // закрываем запрос
        mysqli_close($link); // закрываем подключение
    } else {
        echo 'Не правильный post-запрос';
    }
}

?>