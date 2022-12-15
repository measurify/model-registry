//validation functions used for input disable/validation etc.
//the can be defined when required and used as "pointer to function" into the appropriate dict config.js
//return must be coherent with name: i.e isInUse => true when is used

import { get_generic } from "./http_operations";

//this function return true if the feature is in use (check on measurements/devices)
export async function isFeatureInUse(feature) {
  const qs = { filter: JSON.stringify({ feature: feature }) };

  try {
    //check if feature has associated measurements
    const res = await get_generic("measurements", qs);
    if (res.totalDocs > 0) {
      //has measurements, so it's in use
      return true;
    } else {
      //if the feature has no measurements, check if it has device associated
      const qs = { filter: JSON.stringify({ features: feature }) };
      const res = await get_generic("devices", qs);

      if (res.totalDocs > 0) {
        //has a device, so it's in use
        return true;
      } else return false;
    }
  } catch (errors) {
    console.log("Error on isFeatureInUse");
    console.log(errors);
    return false;
  }
}

//this function always return true
export function alwaysTrue() {
  return true;
}
