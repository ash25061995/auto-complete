import { getRequest } from "../api";

interface StandardError {
    errorData: any;
    userMessage: string;
    developerMessage: string;
}
const NA: string = 'NOT_AVAILABLE';

const GET_USERS: string = '/users';

interface UsersContent {
    data: Array<UserContent>;
}

interface UserContent {
    id: number;
    name: string;
    userName: string;
}

const getUsersApi = async (): Promise<any> => {
    const apiRoute = GET_USERS;
    return new Promise((resolve, reject) => {
        getRequest({
            route: apiRoute,
        })
            .then((response) => {
                const responseData = response?.data;
                resolve(responseData);
            })
            .catch((err) => {
                reject(err.userMessage);
            });
    });
};

const parseProtection = (callback: Function): any => {
    try {
        return callback();
    } catch (err) {
        const error: StandardError = {
            errorData: callback?.toString() || NA,
            userMessage: 'UnExpected error occurred !',
            developerMessage: 'Parsing error !',
        };
        throw error;
    }
};

const toUserContent = (item: any): UserContent => {
    return parseProtection(() => {
        return {
            id: item?.id,
            name: item?.name,
            userName: item?.userName
        };
    });
};

const toUsersContent = (data: any): UsersContent => {
    return parseProtection(() => {
        return {
            data: data.map((item: any) => {
                return toUserContent(item);
            })
        };
    });
};

const getUsersApiCall = async (): Promise<UsersContent> => {
    return new Promise((resolve, reject) => {
        getUsersApi()
            .then((response : any) => {
                resolve(toUsersContent(response));
            })
            .catch((err : any) => {
                reject(err);
            });
    });
};

export {
    getUsersApiCall
}