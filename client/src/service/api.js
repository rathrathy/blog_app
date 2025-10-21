import axios from 'axios';
import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config.js';
import { getAccessToken, getRefreshToken } from '../utils/common-utils.js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // Increased timeout
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
});

// Special instance for file uploads
export const uploadInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data"
    }
});


axiosInstance.interceptors.request.use(
    function(config) {
        // if (config.TYPE.params) {
        //     config.params = config.TYPE.params
        // } else if (config.TYPE.query) {
        //     config.url = config.url + '/' + config.TYPE.query;
        // }
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function(response) {
        // Stop global loader here
        return processResponse(response);
    },
    function(error) {
        // Stop global loader here
        return Promise.reject(processError(error));
    }
);

const processResponse = (response) => {
    if (response?.status === 200) {
        return { isSuccess: true, data: response.data }
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        }
    }
};

const processError = async (error) => {
    if (error.response) {
        console.log("ERROR IN RESPONSE: ", error.toJSON());
        return{
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.responseFailure,
            code: error.response.status
        }
    
    }else if (error.request) { 
        console.log("ERROR IN REQUEST: ", error.toJSON());
        return{
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        }
    
    } else {
        console.log("ERROR IN NETWORK: ", error.toJSON());
        return{
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        }

    }
}

const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: body,
            responseType: value.responseType,
            headers: {
                authorization: getAccessToken(),
            },
            onUploadProgress: function(progressEvent) {
                if (showUploadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showUploadProgress(percentCompleted);
                }
            },
            onDownloadProgress: function(progressEvent) {
                if (showDownloadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showDownloadProgress(percentCompleted);
                }
            }
            
        })
    
    
}

// Add this function to handle file uploads
export const uploadFile = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/file/upload`, data, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export { API };