const socket = io('http://172.19.29.89:3000');
// 用户信息
var userinfo = ''
var imgurl = ''
$('.btnsc').on('click', () => {
    $('#fileIpt').click()
})
$('#fileIpt').change(() => {
    let files = $('#fileIpt')[0].files[0]
    let fr = new FileReader()
    fr.readAsDataURL(files)
    fr.onload = () => {
        //传图片给服务器
        socket.emit('sendImage', {
            img: fr.result
        })

        //接收图片信息
        socket.on('acceptImage', (data) => {
            imgurl = data.img
            $('#Image').attr('src', imgurl)
        })
    }
})

//登录事件
$('.enter').on('click', () => {
    userinfo = {
        nick: $('#nickName').val(),
        avatarurl: $('#fileIpt')[0].files
    }
    if ($('#nickName').val() == '') {
        alert('用户名不能为空');
    } else {
        //如果头像为空，则使用默认头像
        if (userinfo.avatarurl.length == 0) {
            userinfo = {
                nick: $('#nickName').val(),
                avatarurl: 'avatar.jpg'
            }
        } else {
            //用户自己上传头像
            userinfo = {
                nick: $('#nickName').val(),
                avatarurl: imgurl
            }
        }

        //发送到服务器
        socket.emit('user', userinfo)

        //接受服务器返回的信息
        socket.on('status', (status) => {
            //如果用户名没有被占用
            if (status == 1) {
                //进入聊天室
                $('.main').attr('style', 'display:block')
                $('.login').attr('style', 'display:none')

                //加载聊天记录
                socket.on('sendhistory', (data) => {
                    $.each(data, (index, item) => {
                        let content = JSON.parse(item.content)

                        // //判断消息是否是自己的
                        if (content.nick == userinfo.nick) {
                            let msg = `
                                <li class="rightmsg">
                                    <img class="avatar" src="${content.avatarurl}"></img>
                                    <span>${content.content}</span>
                                </li>`
                            $('.list').append(msg)
                            $('.list').children(':last').get(0).scrollIntoView(false)
                        } else {
                            let msg = `
                                <li class="leftmsg">
                                    <div class="nick">${content.nick}</div>
                                    <img class="avatar" src="${content.avatarurl}"></img>
                                    <span>${content.content}</span>
                                </li>
                                `
                            $('.list').append(msg)
                            $('.list').children(':last').get(0).scrollIntoView(false)
                        }
                    })
                    let systemtip = `<div class="systemTip">以上为最近20条信息</div>`
                    $('.list').append(systemtip)
                    $('.list').children(':last').get(0).scrollIntoView(false)
                })

                //当前在线人数
                socket.on('sendCount', (data) => {
                    $('.top > span').text(data)
                })

                //以下为聊天设置
                socket.on('systemtip', (data) => {
                    let sysmsg = `<div class="systemTip">${data}</div>`
                    $('.list').append(sysmsg)
                })

                //发送消息
                //回车事件
                $('.content').on('keyup', (e) => {
                    if (e.keyCode == 13 && e.shiftKey) {
                        $('#sendBtn').click();
                    }
                })
                $('#sendBtn').on('click', (e) => {
                    if ($('.content').html()) {
                        let msgData = {
                            content: $('.content').html(),
                            nick: userinfo.nick,
                            avatarurl: userinfo.avatarurl
                        }
                        socket.emit('send', msgData)
                        $('.content').html('')
                    } else {
                        alert('内容不能为空')
                    }

                })

                //广播发送消息
                socket.on('SendContent', (data) => {
                    //判断消息是否是自己的
                    if (data.nick == userinfo.nick) {
                        let msg = `
                        <li class="rightmsg">
                            <img class="avatar" src="${data.avatarurl}"></img>
                            <span>${data.content}</span>
                        </li>`
                        $('.list').append(msg)
                        $('.list').children(':last').get(0).scrollIntoView(false)
                    } else {
                        let msg = `
                        <li class="leftmsg">
                            <div class="nick">${data.nick}</div>
                            <img class="avatar" src="${data.avatarurl}"></img>
                            <span>${data.content}</span>
                        </li>
                        `
                        $('.list').append(msg)
                        $('.list').children(':last').get(0).scrollIntoView(false)
                    }
                })


                //广播视频
                socket.on('SendVideo', (data) => {
                    //判断消息是否是自己的
                    if (data.nick == userinfo.nick) {
                        let msg = `
                            <li class="rightmsg">
                                <img class="avatar" src="${data.avatarurl}"></img>
                                <span>${data.content}</span>
                            </li>`
                        $('.list').append(msg)
                        $('.list').children(':last').get(0).scrollIntoView(false)
                    } else {
                        let msg = `
                            <li class="leftmsg">
                                <div class="nick">${data.nick}</div>
                                <img class="avatar" src="${data.avatarurl}"></img>
                                <span>${data.content}</span>
                            </li>
                            `
                        $('.list').append(msg)
                        $('.list').children(':last').get(0).scrollIntoView(false)
                    }
                })
            } else {
                alert('用户名被占用')
            }
        })
    }
})


// 表情
$('.emojibtn').on('click', () => {
    $('.content').emoji({
        button: '.emojibtn',
        position: 'topRight',
        showTab: true,
        animation: 'fade',
        icons: [{
            name: "贴吧表情",
            path: "./lib/eshengsky-jQuery-emoji-14683e9/dist/img/tieba/",
            maxNum: 50,
            file: ".jpg",
            placeholder: ":{alias}:",
            alias: {
                1: "hehe",
                2: "haha",
                3: "tushe",
                4: "a",
                5: "ku",
                6: "lu",
                7: "kaixin",
                8: "han",
                9: "lei",
                10: "heixian",
                11: "bishi",
                12: "bugaoxing",
                13: "zhenbang",
                14: "qian",
                15: "yiwen",
                16: "yinxian",
                17: "tu",
                18: "yi",
                19: "weiqu",
                20: "huaxin",
                21: "hu",
                22: "xiaonian",
                23: "neng",
                24: "taikaixin",
                25: "huaji",
                26: "mianqiang",
                27: "kuanghan",
                28: "guai",
                29: "shuijiao",
                30: "jinku",
                31: "shengqi",
                32: "jinya",
                33: "pen",
                34: "aixin",
                35: "xinsui",
                36: "meigui",
                37: "liwu",
                38: "caihong",
                39: "xxyl",
                40: "taiyang",
                41: "qianbi",
                42: "dnegpao",
                43: "chabei",
                44: "dangao",
                45: "yinyue",
                46: "haha2",
                47: "shenli",
                48: "damuzhi",
                49: "ruo",
                50: "OK"
            },
            title: {
                1: "呵呵",
                2: "哈哈",
                3: "吐舌",
                4: "啊",
                5: "酷",
                6: "怒",
                7: "开心",
                8: "汗",
                9: "泪",
                10: "黑线",
                11: "鄙视",
                12: "不高兴",
                13: "真棒",
                14: "钱",
                15: "疑问",
                16: "阴脸",
                17: "吐",
                18: "咦",
                19: "委屈",
                20: "花心",
                21: "呼~",
                22: "笑脸",
                23: "冷",
                24: "太开心",
                25: "滑稽",
                26: "勉强",
                27: "狂汗",
                28: "乖",
                29: "睡觉",
                30: "惊哭",
                31: "生气",
                32: "惊讶",
                33: "喷",
                34: "爱心",
                35: "心碎",
                36: "玫瑰",
                37: "礼物",
                38: "彩虹",
                39: "星星月亮",
                40: "太阳",
                41: "钱币",
                42: "灯泡",
                43: "茶杯",
                44: "蛋糕",
                45: "音乐",
                46: "haha",
                47: "胜利",
                48: "大拇指",
                49: "弱",
                50: "OK"
            }
        }, {
            name: "QQ高清",
            path: "./lib/eshengsky-jQuery-emoji-14683e9/dist/img/qq/",
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: ".gif",
            placeholder: "#qq_{alias}#"
        }, {
            name: "emoji高清",
            path: "./lib/eshengsky-jQuery-emoji-14683e9/dist/img/emoji/",
            maxNum: 84,
            file: ".png",
            placeholder: "#emoji_{alias}#"
        }]
    });
})


//发送图片
$('.sendimgfiles').on('click', () => {
    $('.imgfile').click()
})
$('.imgfile').on('change', () => {
    let file = $('.imgfile')[0].files[0]
    let fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = () => {
            let img = '<img src="' + fr.result + '" class="outimg"></img>'
            $('.content').append(img)
        }
        //清除文件
    $('.imgfile').after($('.imgfile').val(''))
})

//发送视频
$('.sendvideofiles').on('click', () => {
    $('.videofile').click()
})
$('.videofile').on('change', () => {
    let video = $('.videofile')[0].files[0]
    let fd = new FormData()
    fd.append('video', video)
    $.ajax({
        method: 'post',
        url: 'http://172.19.29.89:3000/upload',
        contentType: false,
        processData: false,
        data: fd,
        success: (res) => {
            if (res.status == 1) {
                let videoMsg = {
                    nick: $('#nickName').val(),
                    avatarurl: 'avatar.jpg',
                    content: '<video controls width="270px" src="' + res.url + '"></video>'
                }

                socket.emit('sendvideo', videoMsg)
            }
        }
    })

    //清除文件
    $('.videofile').after($('.videofile').val(''))
})