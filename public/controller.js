$(function () {
    // const socket = io.connect('http://localhost:8080')
    // const socket = io('https://point-chat.herokuapp.com/')
    const socket = io('https://point-chat.herokuapp.com?id=2')
    // const socket = io.connect(':80')
    const BASE_URL = 'https://baas.kinvey.com/'
    const APP_KEY = 'kid_ryf9q5EDX'
    const APP_SECRET = '9d1ba889d20143d5981a227bc581aeb7'
    const AUTH_HEADERS = { 'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET) }
    let currentTime  = new Date().getHours()
    let msgForSort = []

    // "socket.io": "^2.1.1",

    let name = $('#name')
    let password = $('#password')
    let btnSend = $('.enter__submit')
    let output = $('.chatbox__content')
    let message = $('#enterMessage')
    let sortBtn = $('#sortButton')

    function signInUser(res, message) {
        sessionStorage.setItem('username', res.username)
        sessionStorage.setItem('authToken', res._kmd.authtoken)
        sessionStorage.setItem('id', res._id)
        sessionStorage.setItem('name', res.name)
        sessionStorage.setItem('gender', res.gender)
        sessionStorage.setItem('avatar', res.avatar)
        showInfo(message)
    }

    $('.modal__dialog').hide()
    name.on('keypress', function (e) {
        if (e.keyCode === 13) {
            loginUser()
        }
    })
    password.on('keypress', function (e) {
        if (e.keyCode === 13) {
            loginUser()
        }
    })
    function loginUser() {
        let username = $('#name').val()
        let password = $('#password').val()
        if (name && password) {
            $.ajax({
                method: 'POST',
                url: BASE_URL + 'user/' + APP_KEY + '/login',
                headers: AUTH_HEADERS,
                data: { username, password }
            }).then(function (res) {
                signInUser(res, 'Успешно влизане.')
                socket.emit('new user', { name: res.name, avatar: res.avatar }, function(data) {
                    if (data) {
                        $('#login').hide(500);
                        $('.modal__dialog').show()
                        $('.modal__dialog').fadeIn();
                    }
                })
                getHistory()
            }).catch(handleAjaxError)
        }
    }
    message.on('keypress', function (e) {
        if (e.keyCode === 13 ) {
            if (this.value.trim().length > 0) {
                socket.emit('send message', message.val());
                message.val('');
                message.focus();
                e.preventDefault()
            }
        }
    })
   btnSend.on('click', function () {
       if (message.val() !== '') {
           socket.emit('send message',message.val());
           message.val('');
           message.focus();
       }
   })
    sortBtn.on('click', function () {
        let infoTime = ''
        if (currentTime >= 8 && currentTime <= 13 ) {
            infoTime = '08:30ч.'
        } else if (currentTime >= 13 && currentTime <= 17) {
            infoTime = '14:00ч.'
        }else if (currentTime >= 17 && currentTime <= 20) {
            infoTime = '18:00ч.'
        } else if (currentTime >= 20 && currentTime <= 1) {
            infoTime = '20:30ч.'
        } else if (currentTime >= 1 && currentTime <= 3) {
            infoTime = '02:00ч.'
        } else if (currentTime >= 3 && currentTime <= 5) {
            infoTime = '04:00ч.'
        } else if (currentTime >= 5 && currentTime <= 8) {
            infoTime = '06:00ч.'
        }
        msgForSort = []
        if (msgForSort.length === 0) {
            swal({
                title: `Все още няма обадили се за ${infoTime}`,
            });
        }
        $.getJSON('history.json', function (historyData) {
            for (let i = 0; i < historyData.length; i++) {
                let onlyNumber = /\d+/gm
                if (historyData[i].msg.match(onlyNumber)) {
                    msgForSort.push(historyData[i].msg.trim())
                    msgForSort.map(Number)
                    msgForSort.sort((a, b) => a - b)
                }
            }
            console.log(infoTime);
            swal(`Всички обадили се за радиовръзката в ${infoTime}`, `${msgForSort.join('\n')}`);
        })
    })
    socket.on('new message',function(data){
        output.append(` <div class="message">
                            <div class="message__head">
                                <span class="message__note">${data.user}</span>
                                <span class="message__note">${data.date}</span>
                            </div>
                            <div class="message__base">
                                <div class="message__avatar avatar">
                                    <a href="#" class="avatar__wrap">
                                        <img class="avatar__img" src="${data.avatar}" width="35" height="35" alt="avatar image">
                                    </a>
                                </div>
                                <div class="message__textbox">
                                    <span class="message__text">${data.msg}</span>
                                </div>
                            </div>
                        </div>`);
        $('.chatbox__row_fullheight').stop().animate({scrollTop: $('.chatbox__row_fullheight')[0].scrollHeight}, 1000)
    })
    socket.on('usernames',function(data){
        $('.users').empty()
        for (const obj of data) {
            var user = `<li class="users__item">
                        <div class="users__avatar avatar avatar_online">
                            <a href="#" class="avatar__wrap">
                                <img class="avatar__img" src="${obj.avatar}" width="35" height="35" alt="avatar image">
                            </a>
                        </div>
                        <span class="users__note">${obj.name}</span>

                    </li>`
            $('.users').append(user)
        }
    })
    socket.on('delete user',function(userForRemove){
        $(".users li:contains('" + userForRemove.name + "')").remove()
    })
    
    function getHistory() {
        $.getJSON('history.json', function (historyData) {
            for (let i = 0; i < historyData.length; i++) {
                output.append(` <div class="message">
                                    <div class="message__head">
                                        <span class="message__note">${historyData[i].user}</span>
                                        <span class="message__note">${historyData[i].date}</span>
                                    </div>
                                    <div class="message__base">
                                        <div class="message__avatar avatar">
                                            <a href="#" class="avatar__wrap">
                                                <img class="avatar__img" src="${historyData[i].avatar}" width="35" height="35" alt="avatar image">
                                            </a>
                                        </div>
                                        <div class="message__textbox">
                                            <span class="message__text">${historyData[i].msg}</span>
                                        </div>
                                    </div>
                                </div>`);
            }
        })
    }

    setInterval(function () {
        let nowTime = new Date()
        if (nowTime.getHours() === 9 && nowTime.getMinutes() === 59 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
        if (nowTime.getHours() === 16 && nowTime.getMinutes() === 59 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
        if (nowTime.getHours() === 19 && nowTime.getMinutes() === 29 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
        if (nowTime.getHours() === 0 && nowTime.getMinutes() === 59 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
        if (nowTime.getHours() === 3 && nowTime.getMinutes() === 15 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
        if (nowTime.getHours() === 5 && nowTime.getMinutes() === 15 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
        if (nowTime.getHours() === 7 && nowTime.getMinutes() === 15 &&  nowTime.getSeconds() === 1) {
            output.empty()
            msgForSort = []
        }
    }, 1000)


    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response)
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error."
        if (response.responseJSON && response.responseJSON.description)
            errorMsg = response.responseJSON.description
        showError(errorMsg)
    }

    $( document ).on('ajaxStart', function() {
        $("#loadingBox").show()
    });
    $( document ).on('ajaxStop', function() {
        $("#loadingBox").hide()
    });

    function showInfo(message) {
        $("#infoBox > span").text(message)
        $("#infoBox").show()
        setTimeout(function () {
            $("#infoBox").hide()
        }, 3000)
    }

    function attachBoxesEvents() {
        $('#errorBox').on('click', function () {
            $(this).hide()
        })
        $('#infoBox').on('click', function () {
            $(this).hide()
        })
    }

    function showError(message) {
        $("#errorBox > span").text(message)
        $("#errorBox").show()
        setTimeout(function () {
            $("#errorBox").hide()
        }, 3000)
    }
})

