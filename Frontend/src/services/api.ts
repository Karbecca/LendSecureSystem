import axios from 'axios';

// Create a configured axios instance
// We use a relative URL assuming we might use a proxy, 
// OR you can hardcode 'https://localhost:7216/api' if you don't set up a proxy.
// For now, let's target the likely backend port directly or use an environment variable.
const API_URL = 'http://localhost:5057/api'; // Updated to match your running backend

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log("Attaching token:", token.substring(0, 10) + "...");
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log("No token found in localStorage");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Auto Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optional: Redirect to login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
// Extended API methods
const extendedApi = {
    ...api,
    get: api.get,
    post: api.post,
    put: api.put,
    delete: api.delete,
    patch: api.patch,

    // Borrower methods
    getWallet: () => api.get('/wallet').then(res => res.data),
    getLoans: () => api.get('/loans').then(res => res.data),
    getMyRepayments: () => api.get('/repayments/my-repayments').then(res => res.data),
    getMyKycDocuments: () => api.get('/kyc/my-documents').then(res => res.data),
    uploadKycDocument: (formData: FormData) => api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
    makePayment: (data: { repaymentId: string }) => api.post('/repayments/pay', data).then(res => res.data),

    // Lender methods
    getApprovedLoans: () => api.get('/loans').then(res => res.data),
    getMyFundings: () => api.get('/funding/my-fundings').then(res => res.data),
    getLenderRepayments: () => api.get('/repayments/lender-repayments').then(res => res.data),
    fundLoan: (data: { loanId: string; amount: number }) => api.post('/funding/fund-loan', data).then(res => res.data),
    getMyAuditLogs: (page = 1, pageSize = 50) => api.get(`/funding/my-audit-logs?page=${page}&pageSize=${pageSize}`).then(res => res.data),
};

export default extendedApi;

