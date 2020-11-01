function isNotSet(o) {
    return o === null || o === undefined;
}

function isSet(o) {
    return o !== null && o !== undefined;
}

function isBlank(o) {
    if (isNotSet(o)) {
        return true;
    }
    if (typeof o === 'string') {
        if (o.length === 0) {
            return true;
        }
        if (o.match(/^\s*$/)) {
            return true;
        }
    }
    return false;
}

function isNotBlank(o) {
    return !isBlank(o);
}

function parseNumber(n) {
    if (isBlank(n)) {
        return null;
    }

    if (n.startsWith('0x')) {
        return parseInt(n, 16);
    } else {
        return parseInt(n, 10);
    }
}

module.exports = {isSet, isNotSet, isBlank, isNotBlank, parseNumber}