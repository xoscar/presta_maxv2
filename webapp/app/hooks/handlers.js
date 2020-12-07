// dependencies
import { useState } from 'react';

const useInputHandler = (defaultObj) => {
  const [obj, setObj] = useState(defaultObj);

  return [obj, (key, event) => {
    setObj({
      ...obj,
      [key]: event.target.value,
    });
  }, setObj];
};

const useHandleSubmit = () => {
  const [error, setError] = useState(null);

  return [error, async (func) => {
    event.preventDefault();

    try {
      await func();
    } catch (err) {
      setError(err);
    }
  }];
};

export {
  useHandleSubmit,
  useInputHandler,
};
