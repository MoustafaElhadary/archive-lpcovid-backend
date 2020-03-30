const formatPrice = (amount, currency) => {
  let number = 0;
  if (typeof amount === "string") {
    number = parseFloat(amount);
  } else if (typeof amount === "number") {
    number = amount;
  } else {
    return "NaN";
  }

  let numberString = Math.abs(number).toFixed(2);

  const [ones, decimals] = numberString.split(".");
  numberString = `${ones.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}${
    decimals ? `.${decimals}` : ""
  }`;
  if (number < 0) numberString = `-${numberString}`;
  return numberString;
};

const numberWithCommas = x => {
  try{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }catch(e){
    return x
  }
};

module.exports = {numberWithCommas,formatPrice };
