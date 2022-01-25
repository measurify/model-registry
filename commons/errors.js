
exports.internal_server_error                = { status: 500, value:  0, message: 'Internal server error' };
exports.generic_upload_error                 = { status: 500, value:  1, message: 'Upload error' };
exports.generic_download_error               = { status: 500, value:  2, message: 'Download error' };
exports.authentication_error                 = { status: 401, value:  3, message: 'Authentication error' };
exports.generic_request_error                = { status: 400, value:  4, message: 'The request has errors' };
exports.post_request_error                   = { status: 400, value:  5, message: 'Resource not created' };
exports.get_request_error                    = { status: 400, value:  6, message: 'Search request error' };
exports.delete_request_error                 = { status: 400, value:  7, message: 'Delete request error' };
exports.put_request_error                    = { status: 400, value:  8, message: 'Modify request error' };
exports.resource_not_found                   = { status: 404, value:  9, message: 'Resource Not found' };
exports.restricted_access_read               = { status: 403, value: 10, message: 'You cannot read this resource' };
exports.restricted_access_create             = { status: 403, value: 11, message: 'You cannot create a new resource' };
exports.restricted_access_modify             = { status: 403, value: 12, message: 'You cannot modify this resource' };
exports.restricted_access_delete             = { status: 403, value: 13, message: 'You cannot delete this resource' };
exports.incorrect_info                       = { status: 401, value: 14, message: 'Please, the body information is missing valid fields'}; 

exports.manage = function(res, error, more) {
    if( typeof more === 'object' && more !== null) more = more.toString();
    if(!error) error = this.internal_server_error;
    error.details = more;
    if(res.constructor.name === 'WebSocket') { 
        res.send('data: ' + JSON.stringify(error) + '\n\n'); 
        res.close();
    }
    else return res.status(error.status).json(error); 
}
