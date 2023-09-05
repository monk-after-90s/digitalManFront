let base_url = '/api';
//音频播放组件
let ad = new Audio();
//视频播放组件
let vd = document.getElementById('video');

function submitForm() {
    //表单
    const form = document.getElementById('form')
    // 获取表单元素
    const formObj = formToObj(form);
    //更新数字人背景视频
    if (!document.getElementById('bg_video').src.endsWith(`static/videos/${formObj.digman}.mp4`)) {
        prepare_show(formObj.digman);
    }
    //建立一个流
    const params = new URLSearchParams();
    params.append('digital_man', formObj.digman);
    fetch(`${base_url}/avSustainStream/establish_stream?` + params.toString())
        .then(response => response.json())
        .then(streamId => {
            console.log(`streamId=${streamId}`);
            //视频播放
            vd.style.display = "block";
            vd.src = `${base_url}/avSustainStream/listen_video_stream?stream_id=${streamId}`;

            //音频播放
            ad.src = `${base_url}/avSustainStream/listen_audio_stream?stream_id=${streamId}`;
            ad.load();
            ad.play().then(r => {
            });
        });


    // // 使用fetch API发送POST请求
    // console.log("formObj:", formObj);
    // fetch(`${base_url}/let_digman_talk`, {
    //     method: 'POST', body: JSON.stringify(formObj), headers: {
    //         'Content-Type': 'application/json'
    //     }
    // }).then(response => response.json()) // 解析JSON响应
    //     .then(video_count => {
    //         console.log(`streamId=${streamId} video_count=${video_count}`);
    //         // 处理音视频分段播放
    //         let encoded_stream_id = encodeURIComponent(streamId);
    //
    //         vd.style.display = "block";
    //         playVideoAudio(encoded_stream_id, 0, video_count);
    //     })
    //     .catch(error => {
    //         console.error('提交表单时出错:', error);
    //     });
}

/**
 * 播放stream_id的第index个视频音频，然后接着播放下一个，直到播放至第max_index个
 * @param encoded_stream_id
 * @param {number} index encoded_stream_id流的视频分段编号
 * @param count
 */
function playVideoAudio(encoded_stream_id, index, count) {
    //递归尾
    if (index >= count) {
        vd.style.display = "none";
        console.log("播放完毕");
        return;
    }


    //视频播放
    vd.src = `${base_url}/digman_video?stream_id=${encoded_stream_id}&index=${index}`;
    //音频播放
    //新播音源
    ad.src = `${base_url}/digman_audio?stream_id=${encoded_stream_id}&index=${index}`;
    ad.load();
    //播放完成的事件
    let play_over_handler = () => {
        playVideoAudio(encoded_stream_id, index + 1, count);
    }
    ad.onended = play_over_handler;
    ad.onerror = play_over_handler;
    ad.play();
}
