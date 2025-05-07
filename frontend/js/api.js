const API_URL = 'http://localhost:3000/api';

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
};

// Resume API calls
export const resumeAPI = {
    create: async (resumeData, token) => {
        try {
            const response = await fetch(`${API_URL}/resumes`, {
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
            const response = await fetch(`${API_URL}/resumes`, {
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
            const response = await fetch(`${API_URL}/resumes/${id}`, {
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
            const response = await fetch(`${API_URL}/resumes/${id}`, {
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
            const response = await fetch(`${API_URL}/resumes/${id}`, {
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