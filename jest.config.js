process.env.TZ = "UTC";

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    projects: [
        "<rootDir>/packages/*/test",
    ],
};
