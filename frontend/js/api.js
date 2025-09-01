// Use environment variable or fallback to localhost
const API_URL = window.API_BASE_URL || 'http://localhost:3000/api';

// Auth API calls
export const authAPI = {
    signup: async (userData) => {
        try {
            console.log('Making signup request to:', `${API_URL}/auth/signup`);
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Signup API error:', error);
            throw error;
        }
    },

    signin: async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Signin API error:', error);
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Forgot password API error:', error);
            throw error;
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Reset password API error:', error);
            throw error;
        }
    },

    validateResetToken: async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/validate-reset-token/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Validate reset token API error:', error);
            throw error;
        }
    },
};

// User API calls
export const userAPI = {
    getProfile: async (token) => {
        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get profile API error:', error);
            throw error;
        }
    },

    updateProfile: async (profileData, token) => {
        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update profile API error:', error);
            throw error;
        }
    },

    changePassword: async (passwordData, token) => {
        try {
            const response = await fetch(`${API_URL}/user/change-password`, {
                method: 'POST',
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Change password API error:', error);
            throw error;
        }
    },
};

// ATS API calls
export const atsAPI = {
    analyzeResume: async (resumeId, jobTitle, industry, token) => {
        try {
            const response = await fetch(`${API_URL}/ats/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
                body: JSON.stringify({
                    resumeId: resumeId,
                    jobTitle: jobTitle,
                    industry: industry
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('ATS analysis API error:', error);
            throw error;
        }
    },

    getATSScore: async (resumeId, token) => {
        try {
            const response = await fetch(`${API_URL}/ats/score/${resumeId}`, {
                headers: {
                    'x-access-token': token,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get ATS score API error:', error);
            throw error;
        }
    },

    getIndustryKeywords: async (industry) => {
        try {
            const response = await fetch(`${API_URL}/ats/keywords/${industry}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get industry keywords API error:', error);
            throw error;
        }
    }
};

// Resume API calls
export const resumeAPI = {
    create: async (resumeData, token) => {
        try {
            const response = await fetch(`${API_URL}/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
                body: JSON.stringify(resumeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create resume API error:', error);
            throw error;
        }
    },

    getAll: async (token) => {
        try {
            const response = await fetch(`${API_URL}/resume`, {
                headers: {
                    'x-access-token': token,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get all resumes API error:', error);
            throw error;
        }
    },

    getOne: async (id, token) => {
        try {
            const response = await fetch(`${API_URL}/resume/${id}`, {
                headers: {
                    'x-access-token': token,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get one resume API error:', error);
            throw error;
        }
    },

    update: async (id, resumeData, token) => {
        try {
            const response = await fetch(`${API_URL}/resume/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
                body: JSON.stringify(resumeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update resume API error:', error);
            throw error;
        }
    },

    delete: async (id, token) => {
        try {
            const response = await fetch(`${API_URL}/resume/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-access-token': token,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Delete resume API error:', error);
            throw error;
        }
    },
}; 