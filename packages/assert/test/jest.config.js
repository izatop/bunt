module.exports = {
    transform: {"src/.+\\.[jt]s?$": ["ts-jest", {}]},
    moduleNameMapper: {
        "^([\\.]+\\/.+)\\/index\\.js": "$1",
        "^([\\.]+\\/.+)\\.js": "$1",
    },
    rootDir: "src",
};
