const toPersianDigits = (text) =>
  text.replace(/\d/g, d => String.fromCharCode(d.charCodeAt(0) + 1728));

export default toPersianDigits;