export function parsePageNumber(value, defaultValue = 1) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return defaultValue;
    }
    return Math.floor(parsed);
}

export function parsePageSize(value, defaultValue = 20, max = 200) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return defaultValue;
    }
    return Math.min(Math.floor(parsed), max);
}

export function parsePositiveInt(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        return null;
    }
    return parsed;
}

export function ensureRecordset(recordset) {
    return Array.isArray(recordset) ? recordset : [];
}

export function wantsApiDocs(req) {
    const docs = req.query.docs;
    return docs === '1' || docs === 'true';
}

export function sendApiDocs(res, { message, example, params, data = [] }) {
    res.json({ message, example, params, data });
}
