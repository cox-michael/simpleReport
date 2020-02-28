const isDate = obj => {
  if (typeof obj.getMonth === 'function') return true;
  // const test2 = new Date(obj);
  // if (typeof test2.getMonth === 'function') return true;
  return false;
};

export default isDate;
