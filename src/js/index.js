import jQuery from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';
import Handlebars from 'handlebars';


document.addEventListener("DOMContentLoaded", coreFunction);


function coreFunction() {


    function init() {

        console.log("Пасхалка для самых любопытных =) 22-31");
        loadModelAndShowBlock('trends', "trend-template", 'trends');
        // loadModelAndShowBlock('trends11', "trend-template", 'trends');


        trendsMainManager();
    }

    init();


    function trendsMainManager() {

        const addTrendFormWrapper = document.querySelector('.manageForm.addData');
        const addTrendForm = document.querySelector('.addTrend');
        const addTrendFormWrapperHeight = addTrendFormWrapper.offsetHeight;

        const updateTrendFormWrapper = document.querySelector('.manageForm.updateData');
        const updateTrendForm = document.querySelector('.updateTrend');
        const updateTrendFormWrapperHeight = updateTrendFormWrapper.offsetHeight;

        const manageTrendsTable = document.querySelector('.manageTrendsTable');


        loadTrends();
        addTrendFormControl();
        updateTrendFormControl();
        manageTrendsTableControl();


        // Add trend
        function addTrendFormControl() {

            if (addTrendForm !== null) {
                addTrendForm.addEventListener("submit", function (e) {
                    e.preventDefault();

                    if(textAreaJsonValidation(updateTrendForm)) {
                        sendRequest('/core/trends.php', addTrendRequest, this, "POST");
                    }

                });
            } else {
                console.log('Формы sendTrend не существует');
            }



        }

        function addTrendRequest(response, form) {
            form.reset();
            if (response === "Запись добавлена") {
                alert("Запись добавлена");
            } else {
                alert("Что-то пошло не так: \r\n" + response);
            }
            loadTrends();
        }


        // Edit trend
        function updateTrendFormControl() {
            if (updateTrendForm) {
                updateTrendFormWrapper.style.height = "0";
                updateTrendFormWrapper.classList.toggle("active", false);
                updateTrendForm.addEventListener("submit", function (e) {
                    e.preventDefault();

                    if(textAreaJsonValidation(updateTrendForm)) {
                        sendRequest('/core/trends.php', updateTrendRequest, this, "POST");
                    }
                });

                updateTrendForm.addEventListener("reset", function (e) {
                    e.preventDefault();
                    updateTrendFormWrapper.style.height = "0";
                    updateTrendFormWrapper.classList.toggle("active", false);
                    addTrendFormWrapper.style.height = addTrendFormWrapperHeight + 10 + "px";
                    addTrendFormWrapper.classList.toggle("active", true);
                })
            }
        }

        function updateTrendRequest(response, form) {
            form.reset();
            form.querySelector('textarea').innerHTML = "";
            if (response === "Запись обновлена") {
                updateTrendFormWrapper.style.height = "0";
                updateTrendFormWrapper.classList.toggle("active", false);
                addTrendFormWrapper.style.height = addTrendFormWrapperHeight + 10 + "px";
                addTrendFormWrapper.classList.toggle("active", true);
                alert("Запись обновлена");
            } else {
                alert("Не удалось обновить. Что-то пошло не так: \r\n" + response);
            }
            loadTrends();
        }

        function addInfoToUpdateTrendForm(info) {
            if (updateTrendForm) {
                addTrendFormWrapper.style.height = "0";
                addTrendFormWrapper.classList.toggle("active", false);
                updateTrendFormWrapper.style.height = updateTrendFormWrapperHeight + 10 + "px";
                updateTrendFormWrapper.classList.toggle("active", true);
                const formInputID = updateTrendForm.querySelector('[name=id]');
                const formInputTitle = updateTrendForm.querySelector('[name=title]');
                const formInputInfo = updateTrendForm.querySelector('[name=info]');
                const formInfo = JSON.parse(info).trends[0];

                formInputID.value = formInfo.id;
                formInputTitle.value = formInfo.title;
                formInputInfo.innerHTML = JSON.stringify(formInfo.info, undefined, 4);

            } else {
                console.log("Формы updateTrendForm нет")
            }
        }


        // Delete trend
        function deleteTrendRequest(response) {
            console.log(response);
            if (response === "Запись удалена") {
                alert("Запись удалена");
            } else {
                alert("Не удалось удалить запись. Что-то пошло не так: \r\n" + response);
            }
            loadTrends();
        }


        // Кнопки EDIT and DELETE
        function manageTrendsTableControl() {
            if (manageTrendsTable !== null) {
                manageTrendsTable.addEventListener("click", function (e) {
                    e.preventDefault();
                    const target = e.target;

                    if (target.classList.contains("js_EditTrendButton")) {
                        e.preventDefault();
                        const button = target;
                        const form = button.parentNode;
                        const FORM_DATA = jQuery(form).serialize();
                        // console.log(FORM_DATA);
                        const formDataObj = paramsToJson(FORM_DATA);
                        if (parseInt(formDataObj.id) > 0) {
                            switch(button.value) {
                                case 'EDIT':
                                    sendRequest('/core/trends.php?id=' + formDataObj.id, addInfoToUpdateTrendForm);
                                    break;
                                case 'DELETE':
                                    sendRequest('/core/trends.php?', deleteTrendRequest, form, "POST");
                                    break;
                            }
                        } else {
                            alert("Что-то пошло не так, передан не верный id: " + formDataObj.id);
                        }


                    }


                });
            }
        }


        // LOAD and SHOW Trends helpers
        function loadTrends() {
            if (manageTrendsTable!== null) {
                sendRequest('/core/trends.php?id=all', showTrends);
            }
        }


        function showTrends(response) {
            const result = JSON.parse(response);
            manageTrendsTable.querySelector("tbody").innerHTML = "";
            result["trends"].forEach(function (item) {
                let newItemROW = `
                        <tr>
                            <td>${item["id"]}</td>
                            <td>${item["title"]}</td>
                            <td>
                                <form class="editTrendForm" method="GET" action="https://okolojs.ru/core/trends.php">
                                    <input type="hidden" name="id" value="${item["id"]}">
                                    <input class="btn btn-info js_EditTrendButton" type="submit" value="EDIT" >
                                </form>
                            </td>
                            <td>
                                <form class="deleteTrendForm" method="POST" action="https://okolojs.ru/core/trends.php">
                                    <input type="hidden" name="method" value="DELETE">
                                    <input type="hidden" name="id" value="${item["id"]}">
                                    <input class="btn btn-danger js_EditTrendButton" type="submit" value="DELETE">
                                </form>
                            </td>
                        </tr>`;
                manageTrendsTable.querySelector("tbody").innerHTML += newItemROW;
            })
        }

    }
    

}

// Устаревшая функция, заменить на новую когда база заработает
function loadModelAndShowBlock(blockid, tpl, filename) {
    const BLOCK = document.getElementById(blockid);
    const SOURCE = document.getElementById(tpl);
    if (BLOCK === null) {
        console.log("Нет места для вывода " + blockid);
        return false;
    }

    if (SOURCE === null) {
        console.log("Нет шаблона " + tpl + "для рендеринга");
        return false;
    }

    if (!filename) {
        console.log("Не указана модель данных, filename is " + filename);
        return false;
    } else {
        console.log("Start render ", blockid, tpl, filename);
        const SRCHTML = SOURCE.innerHTML;
        const template = Handlebars.compile(SRCHTML);


        // 1. Создаём новый объект XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
        xhr.open('GET', 'model/'+filename+'.json', true);

        // 3. Отсылаем запрос
        xhr.send();

        // 4. Если код ответа сервера не 200, то это ошибка
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                // вывести результат

                const result = template(JSON.parse(xhr.responseText));
                BLOCK.innerHTML = result;
            }
        }
    }



}

// HELPERS
function sendRequest(url, callback, form, method = "GET") {
    console.log("Отправляем запрос...");
    let FORM_DATA;
    // 1. Создаём новый объект XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
    if (method == "GET") {
        xhr.open('GET', url, true);
        xhr.send(); // 3. Отсылаем запрос
    } else {
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); //Передает правильный заголовок в запросе
        FORM_DATA = jQuery(form).serialize();
        xhr.send(FORM_DATA); // 3. Отсылаем запрос
    }

    // 4. Если код ответа сервера не 200, то это ошибка
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            form ? callback(xhr.responseText, form) : callback(xhr.responseText); // вызвать колбэк и передать ему ответ
        }
    }
}


function textAreaJsonValidation(form) {
    const errMsg = "Ошибка при проверке данных. ";
    const textArea = form.querySelector('textarea');
    const textAreaVal = textArea.value;
    // собрать данные с текстареа и проверить на соответствие json
    if (IsJsonString(textAreaVal)) {
        const newTrend = JSON.parse(textAreaVal);
        // Проверить на наличие поля title
        console.log(newTrend);
        if("title" in newTrend) {
            if (newTrend.title !== "") {
                return true;
            } else {
              alert(errMsg + "Поле Title не должно быть пустым.")
            }
        } else {
            alert(errMsg + "Вы не указали Title, это обязательный параметр.");
        }
    }
    else {
        alert(errMsg + "Формат данных не соответствует JSON.");
    }
    return false;
}


function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function paramsToJson(string) {
    const obj = {};
    string.split("&").forEach( el => {
        let newProperty = el.split("=");
        obj[newProperty[0]] = newProperty[1];
    });
    return obj;
}


