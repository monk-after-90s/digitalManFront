let base_url = '/api';
//音频播放组件
let ad = new Audio();
//视频播放组件
let vd = document.getElementById('video');

async function submitForm() {
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
    console.log("Try to establish_stream");
    fetch(`${base_url}/avSustainStream/establish_stream?` + params.toString())
        .then(response => response.json())
        .then(streamId => {
            console.log(`streamId=${streamId}`);
            let encoded_stream_id = encodeURIComponent(streamId);
            //视频流播放器
            vd.style.display = "block";
            vd.src = `${base_url}/avSustainStream/listen_video_stream?stream_id=${encoded_stream_id}`;
            //音频流播放器
            fetch(`${base_url}/avSustainStream/listen_audio_stream?stream_id=${encoded_stream_id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("listen_audio_stream fails.");
                    }
                    return response.body.getReader();
                })
                .then(async (reader) => {
                    console.log("get reader");
                    let_digital_man_talk(streamId, formObj.speech_content).then(r => {
                    });
                    while (true) {
                        let {done, value} = await reader.read();
                        if (done) {
                            console.log("Stream ended, closing connection.");
                            break;
                        }
                        let audioData = value.buffer;
                        if (audioData) {
                            const audioContext = new AudioContext();
                            const audioBuffer = await audioContext.decodeAudioData(audioData)
                            const source = audioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioContext.destination);
                            source.start();
                        }
                    }
                })
                .catch((error) => console.error(error));
        });
}

/**
 * 使数字人说话
 * @param {*} streamId
 * @param {Document.speech_content} speech_content
 */
async function let_digital_man_talk(streamId, speech_content) {
    const splitStrings = speech_content.split(/[“”‘’"'。,，;；:：]+/);
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
    }
    //关闭流
    let encoded_stream_id = encodeURIComponent(streamId);
    const params = new URLSearchParams();
    params.append('stream_id', encoded_stream_id);
    const res = await fetch(`${base_url}/avSustainStream/close_stream?` + params.toString());
    //重置沉默视频的播放位置
    document.getElementById('bg_video').currentTime = 0;
    console.log(`Close stream:${decodeURIComponent(encoded_stream_id)} res:${await res.json()}`);
    vd.style.display = "none";
}