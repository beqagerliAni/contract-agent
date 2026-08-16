import lodash from 'lodash';
import { CheckProperty } from './type/checkProperty.type';

// i don't like using Required, so we will write a util funciton that will check property exsitence for tool output
export const checkProperty = (
  object: object,
  checkPropertys: string[],
): CheckProperty => {
  const erros: string[] = [];
  let status = true;
  checkPropertys.forEach((fieldName) => {
    const hasProperty = lodash.has(object, fieldName);
    if (!hasProperty) {
      status = false;
      erros.push(
        `Missing required field: "${fieldName}". First, try to infer or extract this information from the conversation context. If you cannot determine the value with the available information, then ask the user to provide it.`,
      );
    }
  });
  return {
    erros,
    status,
  };
};
