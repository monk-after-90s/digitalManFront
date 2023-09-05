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
            let encoded_stream_id = encodeURIComponent(streamId);
            //视频播放
            vd.style.display = "block";
            vd.src = `${base_url}/avSustainStream/listen_video_stream?stream_id=${encoded_stream_id}`;
            //音频播放
            ad.src = `${base_url}/avSustainStream/listen_audio_stream?stream_id=${encoded_stream_id}`;
            ad.load();
            ad.play().then(r => {
            });
            let_digital_man_talk(streamId, formObj.speech_content).then(r => {
            });
        });
}

/**
 * 使数字人说话
 * @param {*} streamId
 * @param {Document.speech_content} speech_content
 */
async function let_digital_man_talk(streamId, speech_content) {
    const splitStrings = speech_content.split(/[。,，;；:：]+/);
    const cleanedStrings = splitStrings.filter(str => str.trim() !== '');
    for (const s of cleanedStrings) {
        const response = await fetch(`${base_url}/avSustainStream/let_digital_man_talk`, {
            method: 'POST',
            body: JSON.stringify({"stream_id": streamId, "speech_content": s}),
            headers: {'Content-Type': 'application/json'}
        });
        // 检查响应状态是否正常
        if (!response.ok) {
            console.error(`Fail to talk:${s}`);
            return;
        }
        console.log(await response.json());
        await sleep(350 * s.length);
    }
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
