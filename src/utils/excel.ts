import * as XLSX from "xlsx";


export const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
};

export const formatDate = (dateCell: any): string => {
    if (typeof dateCell === "string") {
        return dateCell;
    } else if (typeof dateCell === "number") {
        return XLSX.SSF.format("dd/mm/yyyy", dateCell);
    } else if (dateCell instanceof Date) {
        return dateCell.toISOString().split("T")[0];
    } else {
        throw new Error(`Unsupported date format: ${dateCell}`);
    }
};


function toCamelCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
        .replace(/^./, (match) => match.toLowerCase());
}

export function keysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((v) => keysToCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelCaseKey = toCamelCase(key);
            result[camelCaseKey] = keysToCamelCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
}
