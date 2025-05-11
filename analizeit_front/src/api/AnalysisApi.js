import axios from "./axios";
import {$authHost} from "./axios";

export const getAnalysis = async (userId) => {
    console.log($authHost.interceptors);
    const { data } = await $authHost.get(`/Analysis/get-analyses/${userId}`);
    return data;
}

export const getAnalysisById = async (id, userId) => {
    const { data } = await $authHost.get(`/Analysis/get-analysis/`,  { params: { id, userId } });
    return data;
}

export const uploadFile = async (xmlFile) => {
    const { data } = await $authHost.post("/Analysis/upload-file", xmlFile, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}
export const downloadFile = async (analysisId) => {
    const { data } = await $authHost.get(`/Analysis/generate-report/`, {
        params: { analysisId },
        responseType: "blob",
    });
    return data;
}

export const createAnalysis = async (analysis) => {
    const { data } = await $authHost.post("/Analysis/create-analysis", {
        name: analysis.name,
        fileName: analysis.filePath,
        description: analysis.description,
        userId: analysis.userId
    });
    return data;
}

export const deleteAnalysis = async (id, userId) => {
    const { data } = await $authHost.delete(`/Analysis/delete-analysis`, { params: { id, userId } });
    return data;
}