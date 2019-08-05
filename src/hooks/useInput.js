import { useState } from 'react';

const useInput = (initialValue, initialInvalidValue = false) => {
  const [state, setState] = useState(initialValue);
  const [invalid, setInvalid] = useState(initialInvalidValue);

  const onChange = ({ target: { type, checked, value } }) => {
    const input = type === 'checkbox' ? checked : value;
    setState(input);
  };
  return [state, onChange, setState, invalid, setInvalid];
};

export default useInput;
