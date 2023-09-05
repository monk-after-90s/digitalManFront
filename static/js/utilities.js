/**
 * 随机生成uuid v4字符串
 */
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

function formToObj(form) {
    let formData = new FormData(form);
    let obj = {};

    formData.forEach((value, key) => {
        // 如果obj中已经存在该键，且其值是一个数组，则直接在该数组中追加新的值。
        // 否则，如果obj中已经存在该键，但其值不是数组，则创建一个数组，包含旧值和新值。
        // 如果obj中还不存在该键，则直接添加。
        if (obj[key]) {
            if (Array.isArray(obj[key])) {
                obj[key].push(value);
            } else {
                obj[key] = [obj[key], value];
            }
        } else {
            obj[key] = value;
        }
    });

    return obj;
}

/**
 * 异步sleep
 * @param {number} ms
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}