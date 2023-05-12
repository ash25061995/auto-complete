import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_URL = 'https://jsonplaceholder.typicode.com/';
const TIMEOUT = 5000;
const RESPONSE_STATUS_SUCCESS = 'success';
const RESPONSE_STATUS_FAILED = 'failed';
const API_NETWORK_ERROR = 'Network Error';
const UNAUTHORISED_API = 'UNAUTHORISED';
const FAILURE_RESPONSE_ERROR = 'error_from_api_failure_handler';
const UNEXPECTED_API_ERROR = 'unexpected_error';
const AXIOS_NETWORK_ERROR = 'Error: Network Error';
const RESPONSE_CODE_401 = 401;
const SOME_ISSUE_WITH_RESPONSE = 'Something went wrong! Please try again later.';

const axiosConfig = {
    baseURL: API_URL,
    timeout: TIMEOUT,
};

const AUTHORISED_CLIENT = axios.create(axiosConfig);

const getAuthorizedClient = () => {
    return AUTHORISED_CLIENT;
}
interface IRouteConfig {
    route: string;
    method: 'get' | 'post' | 'put' | 'delete';
    params?: Record<any, any>;
    data?: any;
    axiosClient?: AxiosInstance;
    metricMetaData?: any;
};

interface IGetConfig {
    route: string;
    params?: Record<any, any>;
    axiosClient?: AxiosInstance;
    useCleanArch?: boolean;
    metricMetaData?: any;
};

interface IPostConfig {
    route: string;
    params?: Record<any, any>;
    axiosClient?: AxiosInstance;
    useCleanArch?: boolean;
    metricMetaData?: any;
};

interface ApiResponseData {
    status: number;
    data: {
        status: string;
        code: string;
        msg: string;
        errorData: {
            errorReason: string;
        };
        errorReason: string;
        cause: any;
        data: {
            error: any;
            message: string;
        };
    };
};

const postRequest = (requestConfig: IPostConfig) => {
    const postConfig = {
        route: requestConfig.route,
        data: requestConfig.params,
        axiosClient: requestConfig.axiosClient,
        useCleanArch: requestConfig.useCleanArch,
        metricMetaData: requestConfig.metricMetaData,
        method: 'post',
    };

    //@ts-ignore
    return makeApiRequest(postConfig);
};

const getRequest = (requestConfig: IGetConfig) => {
    //@ts-ignore
    requestConfig.method = 'get';
    //@ts-ignore
    return makeApiRequest(requestConfig);
};

const getApiResponseStatus = (
    response: ApiResponseData,
): { isSuccess: boolean; status: number | string } | undefined => {
    if (response?.data?.data?.error) {
        return { isSuccess: false, status: response.data.data.error };
    }
    if (response?.data?.errorData) {
        return { isSuccess: false, status: response.data.errorData?.errorReason };
    }
    if (response?.data?.status) {
        return {
            isSuccess: response.data.status === RESPONSE_STATUS_SUCCESS,
            status: response.data.status,
        };
    }
    if (response?.status) {
        return { isSuccess: response.status.toString().startsWith('2'), status: response.status };
    }
    return;
};


const handleApiSuccess = (
    response: AxiosResponse<any>,
) => {
    const { isSuccess } = getApiResponseStatus(response) || {};
    console.log(response?.config?.url, response?.data)
    if (isSuccess) {
        return { statusText: RESPONSE_STATUS_SUCCESS, data: response.data };
    } else {
        return { statusText: RESPONSE_STATUS_FAILED, data: {} };
    }
};

const getApiUserMessage = (response: ApiResponseData): string => {
    if (response?.data?.msg) {
        return response.data.msg;
    } else if (response?.data?.errorData?.errorReason) {
        return response.data.errorData.errorReason;
    } else if (response?.data?.cause) {
        return response.data.cause?.name;
    } else if (response?.data?.data?.message) {
        return response.data.data.message;
    }
    return SOME_ISSUE_WITH_RESPONSE;
};

const handleApiFailure = (error: any) => {
    if (error.toString() === AXIOS_NETWORK_ERROR) {
        return {
            statusText: API_NETWORK_ERROR,
        };
    } else {
        const { isSuccess, status } = getApiResponseStatus(error.response) || {};
        if (!isSuccess) {
            if (status === RESPONSE_CODE_401) {
                return {
                    statusText: UNAUTHORISED_API,
                };
            }
            return {
                statusText: FAILURE_RESPONSE_ERROR,
                userMessage: getApiUserMessage(error?.response),
            };
        } else {
            return {
                statusText: UNEXPECTED_API_ERROR,
                userMessage: SOME_ISSUE_WITH_RESPONSE,
            };
        }
    }
};

const makeApiRequest = async (
    requestConfig: IRouteConfig,
): Promise<{ statusText: string; userMessage?: string; data?: any }> => {
    const {
        route,
        method,
        params,
        data,
        axiosClient = getAuthorizedClient(),
    } = requestConfig;

    return new Promise(async (resolve, reject) => {
        try {
            const response = await axiosClient.request({ url: route, data, params, method });
            const responseData = handleApiSuccess(response);
            if (responseData.statusText === RESPONSE_STATUS_FAILED) {
                reject(responseData);
            } else if (responseData.statusText === 'success') {
                resolve(responseData);
            }
        } catch (error) {
            reject(handleApiFailure(error));
        }
    });
};

export {
    postRequest,
    getRequest,
}