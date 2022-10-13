const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

//引入数据库
const db = require('./mysql/index');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: true
});
app.use(cors())

//静态资源
app.use(express.static(path.join(__dirname, 'public')))

//创建表
const createList = 'CREATE TABLE IF NOT EXISTS `chathistory`  (`id` int(0) NOT NULL AUTO_INCREMENT,`content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,PRIMARY KEY (`id`) USING BTREE) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;'
db.query(createList, (err, results) => {
    if (err) {
        console.log(err);
    }
})


//数据存入数据库
function chathistory(data) {
    const sql = 'insert into chathistory set ?'
    let Msg = {
        content: JSON.stringify(data)
    }
    db.query(sql, Msg, (err, results) => {
        if (err) throw err
    })
}

//加载聊天记录
function loadChathistory(socket) {
    const sql = 'select content from chathistory ORDER BY id limit 20'
    db.query(sql, (err, results) => {
        //判断历史信息是否为空
        if (results.length == 0) {
            return
        } else if (err) {
            throw err
        } else {
            socket.emit('sendhistory', results)
        }
    })
}

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

//文件上传
app.post('/upload/file', upload.single('file'), (req, res) => {
    const data = req.file
    data.originalname = Buffer.from(data.originalname, 'latin1').toString('utf8')
    let des_file = path.join(__dirname, 'public/files', data.originalname)
    let filename = data.originalname
    let filesize
    if (data.size < 1000000) {
        filesize = (data.size / 1024).toFixed(1) + 'KB'
    } else {
        filesize = (data.size / 1024 / 1024).toFixed(1) + 'MB'
    }
    fs.readFile(data.path, (err, data) => {
        fs.writeFile(des_file, data, (err) => {
            if (err) {
                return res.send({
                    status: 0,
                    msg: '上传文件失败'
                })
            } else {
                res.send({
                    status: 1,
                    msg: '上传文件成功',
                    url: 'http://172.19.29.89:3000/files/' + filename,
                    name: filename,
                    size: filesize
                })
            }
        })
    })
})

//用户列表
const usersList = []

//聊天室全部用户信息
const usersData = []

io.on("connection", (socket) => {

    //头像
    socket.on('sendImage', (data) => {
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
            usersData.push(data)
            socket.emit('status', '1')
            io.emit('systemtip', data.nick + '加入了聊天室');
            //加载聊天记录
            loadChathistory(socket)

            //返回给客户端当前在线人数
            io.emit('sendCount', usersList.length)

            //返回全部用户信息
            io.emit('userList', usersData)
        } else {
            socket.emit('status', '0')
        }
    })

    //发送消息
    socket.on('send', (data) => {
        data.content = data.content.replace(/<br><br>/g, '<br>')

        //存入数据库
        chathistory(data);
        io.emit('SendContent', data)
    })

    //发送视频
    socket.on('sendvideo', (data) => {
        //存入数据库
        chathistory(data)

        //广播视频
        io.emit('SendVideo', data)
    })

    //发送文件
    socket.on('sendfile', (data) => {
        //存入数据库
        chathistory(data)

        //广播文件
        io.emit('SendVideo', data)
    })

    // 断开连接
    socket.on("disconnect", (reason) => {
        //将用户从用户列表中删除
        let index = usersList.indexOf(socket.username)
        usersList.splice(index, 1)
        usersData.forEach((item, index) => {
            if (item.nick == socket.username) {
                usersData.splice(index, 1)
            }
        })
        console.log('有人断开了连接');
        //刷新当前在线人数
        io.emit('sendCount', usersList.length)
            //刷新在线人数列表
        io.emit('userList', usersData)
    });
});

httpServer.listen(3000, () => {
    console.log('启动成功');
});