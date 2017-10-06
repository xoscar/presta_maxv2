export const wait = (seconds, callback) => {
  setTimeout(callback, seconds * 1000);
};

export const queryStringify = (query = {}) => (
  Object.keys(query).reduce((acc, current) => (
    `${acc}${current}=${query[current]}&`
  ), '?')
);

export default {};
