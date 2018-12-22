const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const fs = require('file-system')

server.listen(process.env.PORT || 4000)
console.log('Listening to request on port 4000')


app.use(express.static('public'))

let nicknames = []
let historyArr = []


function zero(num) {
    return ('0' + num).slice(-2);
}

setInterval(function () {
    let nowTime = new Date()
    if (nowTime.getHours() === 9 && nowTime.getMinutes() === 59 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
    if (nowTime.getHours() === 16 && nowTime.getMinutes() === 59 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
    if (nowTime.getHours() === 19 && nowTime.getMinutes() === 29 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
    if (nowTime.getHours() === 0 && nowTime.getMinutes() === 59 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
    if (nowTime.getHours() === 3 && nowTime.getMinutes() === 15 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
    if (nowTime.getHours() === 5 && nowTime.getMinutes() === 15 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
    if (nowTime.getHours() === 7 && nowTime.getMinutes() === 15 &&  nowTime.getSeconds() === 1) {
        fs.writeFile('./public/history.json', '' )
        historyArr = []
    }
}, 1000)

io.sockets.on('connection',function(socket){
    console.log('connection ', socket.id)
    socket.on('new user', function (data, callback) {
       if (nicknames.indexOf(data) !== -1){
           callback(false)
       } else {
           callback(true)
           socket.nickname = data
           nicknames.push(socket.nickname)
           let countUser = 0
            for (let i = 0; i < nicknames.length; i++) {
               if (nicknames[i].name === socket.nickname.name) {
                   countUser++
               }
               if (countUser > 1) {
                   nicknames.splice(nicknames[i], 1)
                   io.sockets.emit('reset form')
                   break
               }
            }
           io.sockets.emit('usernames', nicknames)
       }
    })
    socket.on('disconnect', function(){
        console.log('user disconnected', socket.nickname)
        io.sockets.emit('delete user', socket.nickname)
        for (let i = 0; i < nicknames.length; i++) {
            if (nicknames[i].name === socket.nickname.name) {
                nicknames.splice(i, 1)
            }
        }
        if (nicknames.length === 0) {
            fs.writeFile('./public/history.json', '' )
        }
    });
    socket.on('send message', function (data) {
        let currentDate = new Date()
        let timeString = zero(currentDate.getHours()) + ':' + zero(currentDate.getMinutes())
        io.sockets.emit('new message', {msg: data, user: socket.nickname.name , date: timeString, avatar: socket.nickname.avatar})
        let chat = {msg: data, user: socket.nickname.name , date: timeString, avatar: socket.nickname.avatar}
        historyArr.push(chat)
        let historyJSON = JSON.stringify(historyArr)
            fs.writeFile('./public/history.json', historyJSON )
    })
})