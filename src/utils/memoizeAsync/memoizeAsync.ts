
interface ICacheValue {
    data: any;
    duration: number;
}

export interface IConfig {
    key: string;
    duration: number;
}

export interface IMemoize {
    asyncFn: CallableFunction;
    config: IConfig;
    callback: CallableFunction;
}

export const memoizeAsync = () => {
    const cache: Record<string, ICacheValue> = {};
    const inProgressQueue: Record<string, Array<CallableFunction>> = {};

    return (asyncFn: CallableFunction, config: IConfig, callback: CallableFunction) => {

        const { key, duration } = config;

        //return the data from cache if it exists in cache
        if (cache.hasOwnProperty(key)) {
            console.info(`Reading from cache for key= [${key}]`)
            callback(cache[key]?.data);
            return;
        }

        //push the callbacks in progress queue
        if (inProgressQueue.hasOwnProperty(key)) {
            inProgressQueue[key].push(callback);
            return;
        } else {
            inProgressQueue[key] = [callback];
        }

        asyncFn().then((data: any) => {
            cache[key] = { data, duration };
            callback(cache[key]?.data)

            for (let cb of inProgressQueue[key]) {
                cb(cache[key].data);
            }

            //clear cache after given duration
            const timeoutId = setTimeout(() => {
                console.info(`Cleared cache for key = [${key}]`);
                delete cache[key];
                delete inProgressQueue[key];
                clearTimeout(timeoutId);
            }, duration)

            //progress queue clean up
            delete inProgressQueue[key];
        })
    }
}