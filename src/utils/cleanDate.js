// import isDate from './isDate';

const cleanDate = date => {
  // if (!isDate(date)) return date;

  // const format = { hour: '2-digit', minute: '2-digit' };
  let cleaned = new Date(date);
  // cleaned = cleaned.toLocaleDateString([], format);
  cleaned = cleaned.toLocaleDateString([]);
  return cleaned.replace(',', ' at');
};

export default cleanDate;
