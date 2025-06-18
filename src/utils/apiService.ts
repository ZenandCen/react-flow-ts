// src/utils/apiService.ts

import axios from 'axios';

// Định nghĩa lại kiểu Method nếu bạn muốn tránh lặp lại
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Performs an HTTP request using Axios.
 *
 * @param requestUrl - The URL for the request.
 * @param requestMethod - The HTTP method (GET, POST, etc.).
 * @param requestHeaders - JSON string of headers. Defaults to '{}'.
 * @param requestBody - JSON string of body for POST/PUT/PATCH. Defaults to undefined.
 * @returns A Promise resolving to an object indicating success/failure and response data/error.
 */
export const performHttpRequestLogic = async (
    requestUrl: string,
    requestMethod: HttpMethod | 'GET', // Sử dụng kiểu HttpMethod
    requestHeaders: string = '{}',
    requestBody: string | undefined = undefined
): Promise<{ success: boolean; data?: any; error?: any; status?: number; headers?: any }> => {
    try {
        let parsedHeaders = {};
        try {
            if (requestHeaders) {
                parsedHeaders = JSON.parse(requestHeaders);
            }
        } catch (parseError) {
            console.error(`Error parsing headers: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            throw new Error(`Error parsing headers: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        let reqBody: any = undefined;
        if (['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
            try {
                if (requestBody) {
                    reqBody = JSON.parse(requestBody);
                }
            } catch (parseError) {
                console.error(`Error parsing body: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
                throw new Error(`Error parsing body: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            }
        }

        const response = await axios({
            method: requestMethod,
            url: requestUrl,
            headers: parsedHeaders,
            data: reqBody,
            timeout: 15000,
        });

        return { success: true, data: response.data, status: response.status, headers: response.headers };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            return { success: false, error: { message: error.message, status: error.response?.status, data: error.response?.data } };
        } else {
            return { success: false, error: { message: error.message || String(error) } };
        }
    }
};