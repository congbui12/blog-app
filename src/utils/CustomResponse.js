class CustomResponse {
    constructor(res) {
        this.res = res;
    }

    send({
        ok = true,
        statusCode,
        message,
        data = null,
        meta = null
    }) {
        const responsePayload = { ok, message };

        if (data !== null && typeof data === 'object') {
            responsePayload.data = data;
        }
        if (meta !== null && typeof meta === 'object') {
            responsePayload.meta = meta;
        }
        if (statusCode === 204) {
            return this.res.status(statusCode).json();
        }
        return this.res.status(statusCode).json(responsePayload);
    }

    success(message = 'Request was successful', data, meta) {
        return this.send({ ok: true, statusCode: 200, message, data, meta });
    }

    created(message = 'Resource created successfully', data, meta) {
        return this.send({ ok: true, statusCode: 201, message, data, meta });
    }

    noContent() {
        return this.send({ ok: true, statusCode: 204 });
    }
}

export default CustomResponse;