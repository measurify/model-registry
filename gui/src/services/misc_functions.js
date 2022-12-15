//check if a generic object is default, according to its type
export const isDefault = (obj) => {
  //undefined is considered default
  if (obj === undefined) return true;
  //null is considered default
  if (obj == null) return true;
  //Nan is default for numbers
  if (typeof obj === "number") {
    return isNaN(obj);
  }

  //default check for strings
  if (typeof obj === "string") {
    return obj === "";
  }

  //input field is an array
  if (Array.isArray(obj)) {
    if (obj.length === 0) return true;
    let def = true;
    obj.forEach((elem) => {
      def = def && isDefault(elem);
    });
    return def;
  }

  //check all values if object
  if (obj.constructor === Object) {
    let def = true;
    Object.entries(obj).forEach(([_, v]) => {
      def = def && isDefault(v);
    });
    return def;
  }
};

//non-default items lenght
export const nonDefaultLength = (obj) => {
  if (Array.isArray(obj) === false) return -1;
  return obj.filter((e) => !isDefault(e)).length;
};

//remove all default or empty field from an object, recursively
export const removeDefaultElements = (obj) => {
  if (Array.isArray(obj)) {
  }
  if (obj.constructor === Object) {
    const entr = Object.entries(obj);
    for (let i = 0; i < entr.length; i++) {
      //check if value is an array
      if (Array.isArray(entr[i][1])) {
        for (let j = 0; j < entr[i][1].length; j++) {
          if (
            entr[i][1][j].constructor === Object ||
            Array.isArray(entr[i][1][j])
          ) {
            removeDefaultElements(entr[i][1][j]);
            if (isDefault(entr[i][1][j])) {
              entr[i][1].splice(j, 1);
            }
          } else {
            if (isDefault(entr[i][1][j])) {
              entr[i][1].splice(j, 1);
            }
          }
        }
      }
      //check if value is an Object
      if (entr[i][1].constructor === Object) {
        const subEntr = Object.entries(entr[i][1]);
        for (let j = 0; j < subEntr.length; j++) {
          if (
            subEntr[i][1].constructor === Object ||
            Array.isArray(subEntr[i][1])
          ) {
            removeDefaultElements(subEntr[i][1]);
          } else {
            if (isDefault(subEntr[i][1])) delete entr[i][1][subEntr[i][0]];
          }
        }
      }
    }
  }

  return obj;
};

//check if two objects (arrays, variables or objects) are equal
export const areEqual = (obj1, obj2) => {
  //undefined check
  if (obj1 === undefined || obj2 === undefined) return false;
  //single value and ref check
  if (obj1 === obj2) return true;

  if (typeof obj1 !== typeof obj2) return false;

  //one is array, other isn't
  if (
    (Array.isArray(obj1) && !Array.isArray(obj2)) ||
    (!Array.isArray(obj1) && Array.isArray(obj2))
  )
    return false;

  //both are array
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    //different length => not equal
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!areEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  //one is object, other isn't
  if (
    (obj1.constructor === Object && obj2.constructor !== Object) ||
    (obj1.constructor !== Object && obj2.constructor === Object)
  )
    return false;

  //both are object
  if (obj1.constructor === Object && obj2.constructor === Object) {
    const k1 = Object.keys(obj1);
    const k2 = Object.keys(obj2);
    if (k1.length !== k2.length) return false;
    if (!areEqual(k1, k2)) return false;

    const v1 = Object.values(obj1);
    const v2 = Object.values(obj2);
    if (!areEqual(v1, v2)) return false;

    return true;
  }
  return false;
};

//capitalize the first letter of a string
export function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

//format string date into yyyy/mm/dd
export function FormatDate(dt) {
  dt = dt.replace("T", " ");
  return dt.slice(0, 19).replaceAll("-", "/");
}

//format metadata [name1:value1 ; name2:value2]
export function FormatMetadata(dt) {
  const str =
    "[ " +
    dt
      .map((el) =>
        el.name + " : " + el.value)
      .join(" ; ") +
    " ]";
  return (    
      str.length <= 100
        ? str
        : str.slice(0, 97) + "..."    
  );
}