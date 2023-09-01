function prepare_show(digman) {
    //背景视频
    document.getElementById('bg_video').src = `static/videos/${digman}.mp4`;
    //数字人头像位置
    fetch('static/head_position.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('video').style.height = `${data[digman].height}vh`;
            document.getElementById('video').style.left = `${data[digman].left}vh`;
            document.getElementById('video').style.top = `${data[digman].top}vh`;
        })
        .catch(error => {
            console.error('读取JSON文件时发生错误：', error);
        });

}