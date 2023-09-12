let base_url = '/api';
//视频播放组件
let vd = document.getElementById('video');

async function submitForm() {
    //表单
    const form = document.getElementById('form');
    // 获取表单元素
    const formObj = formToObj(form);
    //更新数字人背景视频
    if (!document.getElementById('bg_video').src.endsWith(`static/videos/${formObj.digman}.mp4`)) {
        prepare_show(formObj.digman);
    }
    //建立一个流
    const params = new URLSearchParams();
    params.append('digital_man', formObj.digman);
    console.log("Try to establish_stream");
    fetch(`${base_url}/avSustainStream/establish_stream?` + params.toString())
        .then(response => response.json())
        .then(async streamId => {
            console.log(`streamId=${streamId}`);
            let encoded_stream_id = encodeURIComponent(streamId);
            //视频流播放器
            vd.style.display = "block";
            vd.src = `${base_url}/avSustainStream/listen_video_stream?stream_id=${encoded_stream_id}`;

            let_digital_man_talk(encoded_stream_id, formObj.speech_content).then(r => {
            });
        });
}

/**
 * 使数字人说话
 * @param encoded_stream_id
 * @param {Document.speech_content} speech_content
 */
async function let_digital_man_talk(encoded_stream_id, speech_content) {
    //音频流播放器
    const splitStrings = speech_content.split(/[“”‘’"。,，;；:：、？?！!]+/);
    const cleanedStrings = splitStrings.filter(str => str.trim() !== '');
    let ad;
    for (const s of cleanedStrings) {
        //语音播放组件
        ad = new Audio();
        ad.addEventListener("ended", ad.remove);
        ad.addEventListener("ended", () => {
            console.log(`Text:${s} played.`);
        });
        ad.src = `${base_url}/avSustainStream/talk?stream_id=${encoded_stream_id}&speech_content=${s}`;
        ad.play().then(r => {
        });
        //确保顺序后，可以及时切换的时机
        await waitForAudioEvent(ad, "durationchange");
    }
    //等待最后一个音频播放完毕
    await waitForAudioEvent(ad, "ended");
    //关闭流
    const params = new URLSearchParams();
    params.append('stream_id', encoded_stream_id);
    const res = await fetch(`${base_url}/avSustainStream/close_stream?` + params.toString());
    console.log(`Close stream:${decodeURIComponent(encoded_stream_id)} res:${await res.json()}`);
    vd.style.display = "none";
    vd.src = "";
}