const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: true
});
app.use(cors())

//静态资源
app.use(express.static(path.join(__dirname, 'public')))

//视频保存服务器
app.post('/upload', upload.single('video'), (req, res) => {
    const data = req.file
    var filesname = new Date().getTime()
    var des_file = path.join(__dirname, 'public/video', filesname + '.mp4')
    fs.readFile(data.path, (err, data) => {
        fs.writeFile(des_file, data, (err) => {
            if (err) {
                return res.send({
                    status: 0,
                    msg: '上传视频失败'
                })
            } else {
                res.send({
                    status: 1,
                    msg: '上传视频成功',
                    url: 'http://172.19.29.89:3000/video/' + filesname + '.mp4'
                })
            }
        })
    })
})

//用户列表
const usersList = [];

io.on("connection", (socket) => {

    //头像
    socket.on('sendImage', (data) => {
        console.log(data);
        //返回给客户端
        socket.emit('acceptImage', data)
    })

    //接收登录信息
    socket.on('user', (data) => {
        //判断用户是否存在
        if (!usersList.includes(data.nick)) {
            //不存在，添加到用户列表
            socket.username = data.nick
            usersList.push(data.nick)
            socket.emit('status', '1')
            io.emit('systemtip', data.nick + '加入了聊天室');
            //返回给客户端当前在线人数
            io.emit('sendCount', usersList.length)
        } else {
            socket.emit('status', '0')
        }

    })


    //发送消息
    socket.on('send', (data) => {
        data.content = data.content.replace(/<br><br>/g, '<br>')
        io.emit('SendContent', data)
    })

    //发送视频
    socket.on('sendvideo', (data) => {
        //广播视频
        io.emit('SendVideo', data)
    })

    // 断开连接
    socket.on("disconnect", (reason) => {
        //将用户从用户列表中删除
        let index = usersList.indexOf(socket.username)
        usersList.splice(index, 1)
        console.log('有人断开了连接');
        //当前在线人数
        io.emit('sendCount', usersList.length)
    });
});

httpServer.listen(3000, () => {
    console.log('启动成功');
});