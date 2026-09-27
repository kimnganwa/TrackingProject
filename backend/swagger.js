import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Project APIs',
        description: 'API documentation for Task Management and Project Tracking System'
    },
    host: 'localhost:5001',
    schemes: ['http'],

    tags: [
        { name: 'Authentication', description: 'Authentication APIs' },
        { name: 'Users', description: 'User management APIs' },
        { name: 'Projects', description: 'Project management APIs' },
        { name: 'Project Members', description: 'Project member APIs' },
        { name: 'Epics', description: 'Epic management APIs' },
        { name: 'Sprints', description: 'Sprint management APIs' },
        { name: 'Tickets', description: 'Ticket management APIs' },
        { name: 'Metrics', description: 'Workflow metrics APIs' }
    ],

    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter: Bearer <token>'
        }
    },

    security: [
        {
            bearerAuth: []
        }
    ]
};

const outputFile = './swagger_output.json';
// Trỏ vào file gốc chứa các app.use("/api/...", route) 
const routes = ['./src/server.js']; 
swaggerAutogen()(outputFile, routes, doc).then(async () => {
    const fs = await import("fs");

    const swaggerDocument = JSON.parse(
        fs.readFileSync(outputFile, "utf8")
    );

    for (const [path, methods] of Object.entries(swaggerDocument.paths)) {
    let tag = "default";

    if (
        path.includes("/cycle-time") ||
        path.includes("/lead-time") ||
        path.includes("/task-aging") ||
        path.includes("/throughput") ||
        path.includes("/bottlenecks")
    ) {
        tag = "Metrics";
    } else if (path.startsWith("/api/auth")) {
        tag = "Authentication";
    } else if (path.startsWith("/api/users")) {
        tag = "Users";
    } else if (path.startsWith("/api/project-members")) {
        tag = "Project Members";
    } else if (path.startsWith("/api/projects")) {
        tag = "Projects";
    } else if (path.startsWith("/api/epics")) {
        tag = "Epics";
    } else if (path.startsWith("/api/sprints")) {
        tag = "Sprints";
    } else if (path.startsWith("/api/tickets")) {
        tag = "Tickets";
    }

    for (const method of Object.values(methods)) {
        method.tags = [tag];
    }
}

    fs.writeFileSync(
        outputFile,
        JSON.stringify(swaggerDocument, null, 2)
    );

    console.log("Swagger tags generated successfully");
});