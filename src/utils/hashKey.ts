const generateHashKey = (args: any, separator = '||') => {
    const stringifiedArgs = args.map((arg : any) =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    );
    return stringifiedArgs.join(separator);
  };
  
  export default generateHashKey;