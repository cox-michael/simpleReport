const formatDate = (date, format) => {
  let d = format.toLowerCase();
  d = d.replace(/yyyy/g, date.getFullYear());
  d = d.replace(/yy/g, date.toLocaleDateString('en-US', { year: '2-digit' }));
  d = d.replace(/mm/g, date.toLocaleDateString('en-US', { month: '2-digit' }));
  d = d.replace(/month/g, `[${date.toLocaleDateString('en-US', { month: 'long' })}]`);
  d = d.replace(/mon/g, `[${date.toLocaleDateString('en-US', { month: 'short' })}]`);
  // d = d.replace(/min0/g, date.toLocaleString('en-US', { minute: '2-digit' }));
  const min = date.getMinutes();
  d = d.replace(/min0/g, `${min}`.length === 1 ? `0${min}` : min);
  d = d.replace(/min/g, min);
  d = d.replace(/weekday/g, `[${date.toLocaleDateString('en-US', { weekday: 'long' })}]`);
  d = d.replace(/wkday/g, `[${date.toLocaleDateString('en-US', { weekday: 'short' })}]`);
  d = d.replace(/dd/g, date.toLocaleDateString('en-US', { day: '2-digit' }));
  d = d.replace(/d(?![^[]*\])/g, date.toLocaleDateString('en-US', { day: 'numeric' }));

  if (d.includes('h') || d.includes('ampm')) {
    const [h, ampm] = date.toLocaleString('en-US', { hour: 'numeric', hour12: true }).split(' ');
    d = d.replace(/hh/g, `${h}`.length === 1 ? `0${h}` : h);
    d = d.replace(/h(?![^[]*\])/g, h);
    d = d.replace(/ampm/g, ampm);
  }

  d = d.replace(/m(?![^[]*\])/g, date.toLocaleDateString('en-US', { month: 'numeric' }));
  // d = d.replace(/ss/g, date.toLocaleString('en-US', { second: '2-digit' }));
  const s = date.getSeconds();
  d = d.replace(/ss/g, `${s}`.length === 1 ? `0${s}` : s);
  d = d.replace(/s(?![^[]*\])/g, s);
  d = d.replace(/\[|\]/g, '');
  return d;
};

export default formatDate;
