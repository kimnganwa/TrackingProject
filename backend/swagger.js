import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Project APIs',
        description: 'Tự động tạo API cho Postman'
    },
    host: 'localhost:5001',
    schemes: ['http']
};

const outputFile = './swagger_output.json';
// Trỏ vào file gốc chứa các app.use("/api/...", route) 
const routes = ['./src/server.js']; 

swaggerAutogen()(outputFile, routes, doc);