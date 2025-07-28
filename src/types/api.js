/**
 * DeepGram error codes
 */
export var DeepGramErrorCode;
(function (DeepGramErrorCode) {
    DeepGramErrorCode["BadRequest"] = "BAD_REQUEST";
    DeepGramErrorCode["Unauthorized"] = "UNAUTHORIZED";
    DeepGramErrorCode["Forbidden"] = "FORBIDDEN";
    DeepGramErrorCode["NotFound"] = "NOT_FOUND";
    DeepGramErrorCode["RequestTimeout"] = "REQUEST_TIMEOUT";
    DeepGramErrorCode["TooManyRequests"] = "TOO_MANY_REQUESTS";
    DeepGramErrorCode["InternalServerError"] = "INTERNAL_SERVER_ERROR";
    DeepGramErrorCode["BadGateway"] = "BAD_GATEWAY";
    DeepGramErrorCode["ServiceUnavailable"] = "SERVICE_UNAVAILABLE";
})(DeepGramErrorCode || (DeepGramErrorCode = {}));
/**
 * Type guards for API responses
 */
export function isDeepGramError(response) {
    return response.type === 'Error';
}
export function isDeepGramResults(response) {
    return response.type === 'Results';
}
export function isApiError(state) {
    return state.status === 'error';
}
export function isApiSuccess(state) {
    return state.status === 'success';
}
export function isApiLoading(state) {
    return state.status === 'loading';
}
