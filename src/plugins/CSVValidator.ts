/*eslint-disable */
export const requiredError = (headerName: string, rowNumber: number, columnNumber:number) => `A ${headerName} is required in the ${rowNumber} row ${columnNumber} column`;
export const validateError = (headerName:string , rowNumber: number, columnNumber:number) => `${headerName} is not valid in the ${rowNumber} ${columnNumber} column`;
export const headerError = (headerName:string , rowNumber: number, columnNumber:number) => ` The header ${headerName} should not be here`;
