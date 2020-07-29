function _serializeForm(form: any) {
    let temp = {};
    Object.keys(form).forEach(item => {
        temp[item] = form[item].value;
    });
    return temp;
}

function _responseErrorHandler(status: number, statusText: string, url: string, errorHandlerRef: any) {
    errorHandlerRef.showMessage({
        message: statusText ? statusText : 'Network error',
        description: `${url} returned response with status ${status}`,
        type: 'warning',
        icon: 'danger',
    });
}

export function xpost(url: string, data: any, errorHandlerRef: any, formReg: any) {
    let result = [];
    let serializedData = _serializeForm(data);

    Object.keys(serializedData).forEach(e => {
        result.push(encodeURIComponent(e) + '=' + encodeURIComponent(serializedData[e]));
    });

    if (formReg)
        Object.keys(formReg).forEach(e => {
            if (e === 'QuestionnaireAnswers') {
                formReg[e].forEach((item, index) => {
                    let temp = `QuestionnaireAnswers[${index}][QuestionnaireQuestionId]=${
                        item.QuestionnaireQuestionId
                    }&QuestionnaireAnswers[${index}][value]=${
                        typeof item.value === 'string' ? item.value.replace("'", "''") : item.value === true ? 1 : 0
                    }`;
                    result.push(temp);
                });
            } else {
                result.push(encodeURIComponent(e) + '=' + encodeURIComponent(formReg[e]));
            }
        });

    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },

        body: result.join('&'),
    }).then(res => {
        if (res.ok === true) {
            return res.json();
        } else {
            _responseErrorHandler(res.status, res.statusText, res.url, errorHandlerRef);
        }
    });
    //.catch(error => _responseErrorHandler(error.status, error.statusText, error.url, errorHandlerRef));
}

export function xget(url: string) {
    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    }).then(res => {
        return res.json();
    });
}
