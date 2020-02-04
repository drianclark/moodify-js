const productionBaseURL = 'http://35.246.48.148:5000'
const devBaseURL = 'http://localhost:5000'
const production = false

const baseURL = production ? productionBaseURL : devBaseURL 

export {
    baseURL
};
